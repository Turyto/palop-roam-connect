import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { provisionOrder } from '../_shared/esim-provision.ts'
import { provisionESIMCardOrder } from '../_shared/esimcard-provision.ts'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-04-10',
  httpClient: Stripe.createFetchHttpClient(),
})

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const rawBody = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    console.error('[stripe-webhook] rejected — missing Stripe-Signature header')
    return new Response('Missing Stripe-Signature header', { status: 400 })
  }

  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
  if (!webhookSecret) {
    console.error('[stripe-webhook] STRIPE_WEBHOOK_SECRET not set — cannot verify signature')
    return new Response('Webhook secret not configured', { status: 500 })
  }

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret)
  } catch (err: any) {
    console.error(`[stripe-webhook] signature verification failed — ${err.message}`)
    return new Response(`Webhook signature invalid: ${err.message}`, { status: 400 })
  }

  console.log(`[stripe-webhook] received event=${event.type} id=${event.id} livemode=${event.livemode}`)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent, supabase)
        break
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent, supabase)
        break
      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object as Stripe.PaymentIntent, supabase)
        break
      case 'charge.dispute.created':
        await handleDisputeCreated(event.data.object as Stripe.Dispute)
        break
      default:
        console.log(`[stripe-webhook] unhandled event type=${event.type} — acknowledged and ignored`)
    }
  } catch (err: any) {
    console.error(`[stripe-webhook] handler error — event=${event.type} id=${event.id} message=${err.message}`)
    return new Response('Internal error — Stripe will retry', { status: 500 })
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})

async function handlePaymentSucceeded(
  paymentIntent: Stripe.PaymentIntent,
  supabase: ReturnType<typeof createClient>,
): Promise<void> {
  console.log(`[stripe-webhook] handlePaymentSucceeded — paymentIntentId=${paymentIntent.id} amount=${paymentIntent.amount} currency=${paymentIntent.currency}`)

  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('id, status, payment_status, esim_status, esim_package_id, customer_email, user_id, plan_id, plan_name, data_amount')
    .eq('payment_intent_id', paymentIntent.id)
    .single()

  if (fetchError || !order) {
    // ACK with 200 (return normally) so Stripe does NOT retry into a re-disable.
    // With the server-side pending-order fix the order row is committed before the
    // client confirms payment, so a missing order here is anomalous — a historical
    // event from before the fix, a stray/test PaymentIntent, or a manual charge.
    // Retrying cannot conjure the row, so we acknowledge, log loudly, and alert an
    // admin instead of returning 500 (which is what got the endpoint disabled before).
    console.error(`[stripe-webhook] order not found for paymentIntentId=${paymentIntent.id} error=${fetchError?.message ?? 'no row returned'} — acknowledging (200) to protect endpoint health`)
    try {
      await supabase.functions.invoke('notify-provisioning-failure', {
        body: {
          order_id: null,
          customer_email: (paymentIntent.receipt_email as string | null) ?? null,
          payment_intent_id: paymentIntent.id,
          error_message: `Webhook received payment_intent.succeeded but no order row matches payment_intent_id=${paymentIntent.id}. Manual recovery required.`,
          error_type: 'webhook_order_not_found',
        },
      })
    } catch (e: any) {
      console.error(`[stripe-webhook] failed to alert on order-not-found for paymentIntentId=${paymentIntent.id}: ${e?.message}`)
    }
    return
  }

  // --- 1. Mark the order paid (idempotent) ---
  if (order.payment_status !== 'succeeded') {
    const { error: updateError } = await supabase
      .from('orders')
      .update({ payment_status: 'succeeded', status: 'processing', updated_at: new Date().toISOString() })
      .eq('id', order.id)
    if (updateError) {
      console.error(`[stripe-webhook] failed to mark order paid — order=${order.id} error=${updateError.message}`)
      throw updateError
    }
    console.log(`[stripe-webhook] order=${order.id} marked paid — status=processing`)
  } else {
    console.log(`[stripe-webhook] order=${order.id} already paid — continuing to provisioning check`)
  }

  // --- 2. Provisioning idempotency guard ---
  if (order.esim_status === 'provisioned') {
    // Defensive: an order can be provisioned by the client-invoked esim-access path
    // before this webhook fires. Make sure its status still reaches 'completed' so it
    // never lingers as 'processing' in the customer's order history.
    if (order.status !== 'completed') {
      const { error: completeError } = await supabase
        .from('orders')
        .update({ status: 'completed', completed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('id', order.id)
      if (completeError) {
        console.error(`[stripe-webhook] order=${order.id} already provisioned but failed to flip status to completed — ${completeError.message}`)
        throw completeError
      }
      console.log(`[stripe-webhook] order=${order.id} already provisioned — flipped status to completed`)
    } else {
      console.log(`[stripe-webhook] order=${order.id} already provisioned and completed — nothing to do`)
    }
    return
  }
  const { data: activation } = await supabase
    .from('esim_activations')
    .select('id, provisioning_status')
    .eq('order_id', order.id)
    .maybeSingle()
  if (activation?.provisioning_status === 'completed') {
    console.log(`[stripe-webhook] order=${order.id} eSIM already provisioned (activation completed) — nothing to do`)
    return
  }

  // --- 3. Atomic claim — only one invocation may provision ---
  // Flip esim_status pending|failed|null → provisioning. If another concurrent
  // invocation (or a Stripe retry) already claimed it, this returns 0 rows and
  // we back off, preventing a duplicate supplier order (real money).
  const { data: claimed, error: claimError } = await supabase
    .from('orders')
    .update({ esim_status: 'provisioning', updated_at: new Date().toISOString() })
    .eq('id', order.id)
    .is('esim_order_id', null) // never re-purchase if a supplier order (or pending marker) exists — real money
    .or('esim_status.eq.pending,esim_status.eq.failed,esim_status.is.null')
    .select('id')
  if (claimError) {
    console.error(`[stripe-webhook] provisioning claim failed — order=${order.id} error=${claimError.message}`)
    throw claimError
  }
  if (!claimed || claimed.length === 0) {
    console.log(`[stripe-webhook] order=${order.id} provisioning already claimed elsewhere — skipping`)
    return
  }

  // --- 4. Provision ---
  const resendApiKey = Deno.env.get('RESEND_API_KEY') ?? ''
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

  if (!order.esim_package_id) {
    console.error(`[stripe-webhook] order=${order.id} has no esim_package_id — cannot provision`)
    await markProvisioningFailed(supabase, order, 'No eSIM package mapping on order')
    return
  }

  // --- 4a. Supplier lookup — branch by esim_packages.supplier for this plan.
  // Default is 'esim_access' (existing path, unchanged). Only an explicit
  // supplier='esimcard' row routes to the eSIMCard provisioner.
  let supplier = 'esim_access'
  try {
    const { data: pkgRow } = await supabase
      .from('esim_packages')
      .select('supplier')
      .eq('plan_id', order.plan_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (pkgRow?.supplier) supplier = pkgRow.supplier as string
  } catch (e: any) {
    console.warn(`[stripe-webhook] supplier lookup failed for order=${order.id} — defaulting to esim_access: ${e?.message}`)
  }

  if (supplier === 'esimcard') {
    const esimcardEmail = Deno.env.get('ESIMCARD_EMAIL') ?? ''
    const esimcardPassword = Deno.env.get('ESIMCARD_PASSWORD') ?? ''
    if (!esimcardEmail || !esimcardPassword) {
      console.error(`[stripe-webhook] eSIMCard credentials not configured — cannot provision order=${order.id}`)
      await markProvisioningFailed(supabase, order, 'eSIMCard credentials not configured')
      return
    }
    console.log(`[stripe-webhook] provisioning order=${order.id} supplier=esimcard package=${order.esim_package_id}`)
    const cardResult = await provisionESIMCardOrder(
      {
        orderId: order.id as string,
        userId: order.user_id as string,
        packageCode: order.esim_package_id as string,
        customerEmail: (order.customer_email as string | null) ?? null,
        planName: (order.plan_name as string | null) ?? null,
        dataAmount: (order.data_amount as string | null) ?? null,
        referenceId: paymentIntent.id,
      },
      {
        supabaseUrl,
        serviceKey,
        creds: { email: esimcardEmail, password: esimcardPassword },
        resendApiKey,
        origin: 'https://palopconnect.com',
        writtenBy: 'stripe-webhook-provision',
      },
    )
    if (cardResult.success) {
      console.log(`[stripe-webhook] order=${order.id} provisioned via eSIMCard — simId=${cardResult.esimTranNo} iccid=${cardResult.iccid}`)
    } else {
      console.error(`[stripe-webhook] order=${order.id} eSIMCard provisioning failed — ${cardResult.error}`)
      await markProvisioningFailed(supabase, order, cardResult.error ?? 'eSIMCard provisioning failed')
    }
    return
  }

  const accessCode = Deno.env.get('ESIM_ACCESS_ACCESS_CODE') ?? ''
  const secretKey = Deno.env.get('ESIM_ACCESS_SECRET_KEY') ?? ''

  if (!accessCode || !secretKey) {
    console.error(`[stripe-webhook] eSIM Access credentials not configured — cannot provision order=${order.id}`)
    await markProvisioningFailed(supabase, order, 'eSIM Access credentials not configured')
    return
  }

  console.log(`[stripe-webhook] provisioning order=${order.id} package=${order.esim_package_id}`)
  const result = await provisionOrder(
    {
      orderId: order.id as string,
      userId: order.user_id as string,
      packageCode: order.esim_package_id as string,
      customerEmail: (order.customer_email as string | null) ?? null,
      planName: (order.plan_name as string | null) ?? null,
      dataAmount: (order.data_amount as string | null) ?? null,
      referenceId: paymentIntent.id,
    },
    {
      supabaseUrl,
      serviceKey,
      creds: { accessCode, secretKey },
      resendApiKey,
      origin: 'https://palopconnect.com',
    },
  )

  if (result.success) {
    // provisionOrder already persisted credentials and marked esim_status=provisioned.
    console.log(`[stripe-webhook] order=${order.id} provisioned — esimTranNo=${result.esimTranNo} iccid=${result.iccid}`)
  } else {
    console.error(`[stripe-webhook] order=${order.id} provisioning failed — ${result.error}`)
    await markProvisioningFailed(supabase, order, result.error ?? 'eSIM provisioning failed')
  }
}

// Record a provisioning failure and alert an admin. Resets esim_status to
// 'failed' so a later retry (Stripe or admin) can re-claim it. Always returns
// (never throws) so Stripe is not retried into an infinite supplier-call loop.
async function markProvisioningFailed(
  supabase: ReturnType<typeof createClient>,
  order: Record<string, any>,
  errorMessage: string,
): Promise<void> {
  try {
    await supabase
      .from('orders')
      .update({
        esim_status: 'failed',
        esim_failure_reason: errorMessage.slice(0, 500),
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id)
  } catch (e: any) {
    console.error(`[stripe-webhook] could not set esim_status=failed for order=${order.id}: ${e?.message}`)
  }
  try {
    await supabase.functions.invoke('notify-provisioning-failure', {
      body: {
        order_id: order.id,
        customer_email: order.customer_email,
        plan_id: order.plan_id,
        plan_name: order.plan_name,
        payment_intent_id: order.payment_intent_id,
        esim_package_id: order.esim_package_id,
        error_message: errorMessage,
        error_type: 'webhook_provisioning_failed',
      },
    })
  } catch (e: any) {
    console.error(`[stripe-webhook] failed to send provisioning failure alert for order=${order.id}: ${e?.message}`)
  }
}

async function handlePaymentFailed(
  paymentIntent: Stripe.PaymentIntent,
  supabase: ReturnType<typeof createClient>,
): Promise<void> {
  const failureCode    = paymentIntent.last_payment_error?.code    ?? 'unknown'
  const failureMessage = paymentIntent.last_payment_error?.message ?? 'unknown'

  console.log(`[stripe-webhook] handlePaymentFailed — paymentIntentId=${paymentIntent.id} code=${failureCode}`)

  const { error } = await supabase
    .from('orders')
    .update({
      payment_status: 'failed',
      status: 'failed',
      updated_at: new Date().toISOString(),
    })
    .eq('payment_intent_id', paymentIntent.id)
    .neq('payment_status', 'succeeded')

  if (error) {
    console.error(`[stripe-webhook] failed to update order to failed — paymentIntentId=${paymentIntent.id} error=${error.message}`)
    throw error
  }

  console.log(`[stripe-webhook] order marked failed — paymentIntentId=${paymentIntent.id} reason=${failureCode}: ${failureMessage}`)
}

// P2: abandoned/canceled checkouts. Stripe fires payment_intent.canceled when an
// intent is canceled (manually or after expiry). Mark the matching order 'cancelled'
// so it stops lingering as 'pending' — but never override an order that already paid.
async function handlePaymentCanceled(
  paymentIntent: Stripe.PaymentIntent,
  supabase: ReturnType<typeof createClient>,
): Promise<void> {
  console.log(`[stripe-webhook] handlePaymentCanceled — paymentIntentId=${paymentIntent.id}`)

  const { error } = await supabase
    .from('orders')
    .update({
      payment_status: 'cancelled',
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('payment_intent_id', paymentIntent.id)
    .neq('payment_status', 'succeeded')

  if (error) {
    console.error(`[stripe-webhook] failed to mark order cancelled — paymentIntentId=${paymentIntent.id} error=${error.message}`)
    throw error
  }

  console.log(`[stripe-webhook] order marked cancelled — paymentIntentId=${paymentIntent.id}`)
}

async function handleDisputeCreated(dispute: Stripe.Dispute): Promise<void> {
  console.warn(
    `[stripe-webhook] DISPUTE CREATED — disputeId=${dispute.id} chargeId=${dispute.charge} ` +
    `amount=${dispute.amount / 100} ${dispute.currency.toUpperCase()} reason=${dispute.reason} status=${dispute.status}`
  )
}
