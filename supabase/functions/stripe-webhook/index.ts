import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    .select('id, status, payment_status, esim_package_id, customer_email, user_id, plan_name, data_amount')
    .eq('payment_intent_id', paymentIntent.id)
    .single()

  if (fetchError || !order) {
    console.error(`[stripe-webhook] order not found for paymentIntentId=${paymentIntent.id} error=${fetchError?.message ?? 'no row returned'}`)
    throw new Error(`Order not found for payment_intent: ${paymentIntent.id}`)
  }

  if (order.payment_status === 'succeeded') {
    console.log(`[stripe-webhook] order=${order.id} already has payment_status=succeeded — skipping (idempotent)`)
    return
  }

  const { error: updateError } = await supabase
    .from('orders')
    .update({
      payment_status: 'succeeded',
      status: 'processing',
      updated_at: new Date().toISOString(),
    })
    .eq('id', order.id)

  if (updateError) {
    console.error(`[stripe-webhook] failed to update order=${order.id} error=${updateError.message}`)
    throw updateError
  }

  console.log(`[stripe-webhook] order=${order.id} updated — payment_status=succeeded status=processing customer=${order.customer_email}`)

  const { data: activation } = await supabase
    .from('esim_activations')
    .select('id, provisioning_status')
    .eq('order_id', order.id)
    .maybeSingle()

  if (activation?.provisioning_status === 'completed') {
    console.log(`[stripe-webhook] eSIM already provisioned for order=${order.id} — all good`)
    return
  }

  console.warn(
    `[stripe-webhook] eSIM not yet provisioned for order=${order.id} ` +
    `customer=${order.customer_email} package=${order.esim_package_id} ` +
    `— client-side esim-access flow should complete this`
  )
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

async function handleDisputeCreated(dispute: Stripe.Dispute): Promise<void> {
  console.warn(
    `[stripe-webhook] DISPUTE CREATED — disputeId=${dispute.id} chargeId=${dispute.charge} ` +
    `amount=${dispute.amount / 100} ${dispute.currency.toUpperCase()} reason=${dispute.reason} status=${dispute.status}`
  )
}
