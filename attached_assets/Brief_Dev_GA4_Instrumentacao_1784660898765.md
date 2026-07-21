# Brief técnico — Instrumentação GA4 (para o developer Replit)

**PalopConnect · 21-07-2026 · PT-PT**
Obrigado pela análise — muito clara. Confirmámos que o site não envia eventos personalizados e que usamos **PaymentIntents + Payment Element** (não Checkout Sessions). Com isso, aqui está a decisão fechada e o que implementar. Vai tudo ao encontro da tua própria recomendação.

Measurement ID: **G-52WWSWJ3P7**

---

## Decisão — esquema de eventos (nomes GA4 convencionais)

| Evento | Chave? | Onde/Quando dispara | Parâmetros |
|---|---|---|---|
| `generate_lead` | ✅ | submissão do formulário de lead (site) | `source`, `corridor`, `travel_month` |
| `begin_checkout` | ✅ | ao chegar ao passo de pagamento (Payment Element montado) | `value`, `currency`, `plan_id` |
| `purchase` | ✅ | **server-side**, no webhook, em `payment_intent.succeeded` | `transaction_id`(=PI id), `value`, `currency`, `items`, `channel`, `partner_code` |
| `whatsapp_click` | ❌ (diagnóstico) | clique num link wa.me | `location` |
| `view_plans` | ❌ | ao ver /plans | `corridor` |
| `compatibility_view` | ❌ | ao ver /compatibility | — |

Os eventos-chave órfãos `qualify_lead` e `close_convert_lead` (criados na consola do GA4, sem origem no código) **não têm dependências** — deixar por agora; podem ser apagados mais tarde na consola para evitar confusão.

---

## 1. Client-side (react-ga4)

Disparar os eventos com `ReactGA.event(name, params)`. Exemplos:
```ts
// /plans
ReactGA.event("view_plans", { corridor });

// submissão do formulário de lead
ReactGA.event("generate_lead", { source, corridor, travel_month });

// ao montar o Payment Element
ReactGA.event("begin_checkout", { value, currency: "EUR", plan_id });

// clique num link WhatsApp
ReactGA.event("whatsapp_click", { location: "site_plans" });
```

## 2. O passo crucial — passar o `ga_client_id` para o PaymentIntent

Para o `purchase` server-side ser atribuído ao utilizador/canal certos, capturar o `client_id` do GA4 e incluí-lo na `metadata` do PaymentIntent (junto ao `order_id`, `user_id`, `plan_id`, `referral_code` que já lá estão).

Obter o client_id (assíncrono):
```ts
function getGaClientId(): Promise<string> {
  return new Promise((resolve) => {
    try {
      // react-ga4 expõe gtag; fallback para window.gtag
      const g = (ReactGA as any).gtag ?? (window as any).gtag;
      g("get", "G-52WWSWJ3P7", "client_id", (id: string) => resolve(id || ""));
      setTimeout(() => resolve(""), 800); // não bloquear o checkout
    } catch { resolve(""); }
  });
}
```
Enviar esse valor para o endpoint que cria o PaymentIntent e acrescentar à metadata:
```ts
// backend — ao criar o PaymentIntent
metadata: { order_id, user_id, plan_id, referral_code, ga_client_id }
```

## 3. Server-side — `purchase` no webhook existente

Na Edge Function `stripe-webhook` já existente, no handler de **`payment_intent.succeeded`**, enviar o evento `purchase` ao GA4 via Measurement Protocol e registar em `sales_log`. Código pronto a mesclar: `supabase/functions/stripe-webhook/index.ts` (em anexo). Também trata `payment_intent.payment_failed` / `.canceled` → `failed_payments` (para a recuperação, SOP-04).

Novos *secrets* na função (os Stripe/Supabase já existem):
```
GA4_MEASUREMENT_ID = G-52WWSWJ3P7
GA4_API_SECRET     = (GA4 > Admin > Data Streams > stream > Measurement Protocol API secrets)
```

## 4. Base de dados

Correr `supabase/migrations/20260721_ga4_sales_and_failures.sql` (cria `sales_log` e `failed_payments`, chave = `stripe_payment_intent_id`, RLS ativo).

## 5. Resolver o "2 /success vs 1 venda"

Confirmado: a `/success` é pública e cada reload/regresso conta um `page_view`. Com o `purchase` a disparar **uma vez** no `payment_intent.succeeded` (server-side, com `transaction_id`), a conversão deixa de depender da página e a deduplicação fica garantida. **Não** disparar `purchase` também no cliente (evita duplicados).

---

## Critérios de aceitação

- [ ] `generate_lead`, `begin_checkout`, `whatsapp_click`, `view_plans`, `compatibility_view` visíveis no GA4 DebugView.
- [ ] `ga_client_id` presente na metadata do PaymentIntent.
- [ ] `purchase` chega ao GA4 via webhook com `transaction_id`, `value`, `currency`, `channel`.
- [ ] `purchase` (GA4) = `sales_log` (Supabase) = pagamento no Stripe (reconciliação 1:1).
- [ ] `begin_checkout` e `generate_lead` marcados como eventos-chave no GA4 (depois de dispararem).
- [ ] `failed_payments` a receber registos em falhas/cancelamentos.

## Notas de segurança
- Nunca commitar chaves; usar apenas os *secrets* do Supabase.
- Testar primeiro em modo de teste do Stripe (`sk_test_`, cartão `4242 4242 4242 4242`).

Disponível para esclarecer qualquer ponto. Obrigado!
