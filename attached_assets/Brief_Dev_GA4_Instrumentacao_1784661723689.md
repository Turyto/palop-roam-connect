# Brief técnico — Instrumentação GA4 (para o developer Replit) · v2

**PalopConnect · 21-07-2026 · PT-PT**
Obrigado pela análise — concordamos com tudo. Esta v2 incorpora o teu feedback: faseamento, `purchase` fire-and-forget, `generate_lead` diferido, e testes sem staging. **Nada aqui deve ser mesclado às cegas — adapta ao código existente.**

Measurement ID: **G-52WWSWJ3P7**

---

## Faseamento (implementar por fases, como sugeriste)

**Fase 1 — client-side (risco zero, ~meio dia):** `view_plans`, `compatibility_view`, `whatsapp_click`, `begin_checkout`. Puramente aditivo. Validar no GA4 DebugView.

**Fase 2 — caminho de pagamento (com salvaguardas):** `ga_client_id` na metadata do PaymentIntent + `purchase` server-side no webhook. Testar de ponta a ponta com uma compra real de valor baixo.

---

## Decisão — esquema de eventos

| Evento | Chave? | Fase | Onde/Quando dispara | Parâmetros |
|---|---|---|---|---|
| `view_plans` | ❌ | 1 | ao ver /plans | `corridor` |
| `compatibility_view` | ❌ | 1 | ao ver /compatibility | — |
| `whatsapp_click` | ❌ | 1 | clique num link wa.me | `location` |
| `begin_checkout` | ✅ | 1 | ao montar o Payment Element | `value`, `currency`, `plan_id` |
| `purchase` | ✅ | 2 | **server-side**, webhook, em `payment_intent.succeeded` | `transaction_id`(=PI id), `value`, `currency`, `items`, `channel`, `partner_code` |
| ~~`generate_lead`~~ | — | **diferido** | **não implementar agora** — ver nota abaixo | — |

**`generate_lead` — diferido (bem visto).** Não existe formulário de lead no site com `source`/`corridor`/`travel_month` — seria trabalho novo. Por agora, o sinal de topo de funil é o **`whatsapp_click`** (é de onde vêm os leads reais). O `generate_lead` só entra quando/se construirmos o formulário de captura (tarefa separada, SOP-02).

Eventos-chave órfãos `qualify_lead` e `close_convert_lead` (criados na consola GA4, sem origem no código): sem dependências — deixar por agora, apagar mais tarde na consola.

---

## Fase 1 — Client-side (react-ga4)

`ReactGA.event(name, params)`. Nota GDPR: o GA4 só inicializa após consentimento, portanto estes eventos são no-op para quem recusa — correto, mas significa que **o funil GA4 fica sempre subcontado vs. Stripe** (aceite; a verdade de receita é o Stripe/`sales_log`, não o GA4).
```ts
ReactGA.event("view_plans", { corridor });
ReactGA.event("compatibility_view", {});
ReactGA.event("whatsapp_click", { location: "site_plans" });
ReactGA.event("begin_checkout", { value, currency: "EUR", plan_id }); // ao montar o Payment Element
```

---

## Fase 2 — Caminho de pagamento (com salvaguardas)

### 2a. `ga_client_id` na metadata do PaymentIntent
Editar `create-payment-intent`, acrescentando **um campo** à metadata existente (`order_id`, `user_id`, `plan_id`, `referral_code` + `ga_client_id`). Captura no cliente com timeout para nunca bloquear o checkout:
```ts
function getGaClientId(): Promise<string> {
  return new Promise((resolve) => {
    try {
      const g = (ReactGA as any).gtag ?? (window as any).gtag;
      g("get", "G-52WWSWJ3P7", "client_id", (id: string) => resolve(id || ""));
      setTimeout(() => resolve(""), 800);
    } catch { resolve(""); }
  });
}
```

### 2b. `purchase` server-side — REGRA DE OURO
O `stripe-webhook` é o provisionador autoritativo dos eSIMs (anti-duplo-gasto, `needs_attention`, idempotência). **A chamada ao GA4 é acessória e tem de ser fire-and-forget:**

- **Não** fazer merge do ficheiro externo. Inserir **apenas** o helper `sendGa4Event` + **uma linha** de chamada no handler `payment_intent.succeeded` **já existente**, **depois** do provisionamento estar garantido.
- A chamada **nunca** pode ser `await` no caminho crítico, nem influenciar o código de estado HTTP. Usar `EdgeRuntime.waitUntil(...)` com `.catch()` próprio:
```ts
// dentro do handler succeeded que JÁ existe, após o provisionamento:
EdgeRuntime.waitUntil(
  sendGa4Event(pi.metadata?.ga_client_id ?? "", "purchase", {
    transaction_id: pi.id,
    value: (pi.amount_received ?? pi.amount ?? 0) / 100,
    currency: (pi.currency ?? "eur").toUpperCase(),
    channel: pi.metadata?.referral_code ? "partner" : "direct",
    partner_code: pi.metadata?.referral_code ?? null,
    items: [{ item_id: pi.metadata?.plan_id, item_name: pi.metadata?.plan_id, quantity: 1 }],
  }).catch((e) => console.error("GA4 MP (não crítico):", e))
);
```
O helper `sendGa4Event` e as tabelas estão em anexo (`stripe-webhook/index.ts`, `.sql`) **como REFERÊNCIA** — adaptar, não substituir. Um erro do GA4 **nunca** pode falhar ou atrasar um eSIM.

Secrets novos (os Stripe/Supabase já existem):
```
GA4_MEASUREMENT_ID = G-52WWSWJ3P7
GA4_API_SECRET     = (GA4 > Admin > Data Streams > stream > Measurement Protocol API secrets)
```

### 2c. Reconciliação / dedução
`purchase` dispara uma vez por pagamento (`transaction_id = PI id`) → resolve o "2 /success vs 1 venda" sem depender da página. **Não** disparar `purchase` no cliente.

---

## Testes (sem staging — o site está LIVE, backend único)

- **Fase 1:** validar todos os eventos client-side no **GA4 DebugView** (inofensivo).
- **Fase 2:** **não** trocar para `sk_test_` (mexeria em secrets de produção). Fazer **uma compra real de valor baixo**, confirmar `purchase` no GA4 + linha em `sales_log`, reconciliar com o Stripe, e reembolsar.

## Critérios de aceitação
- [ ] Eventos da Fase 1 visíveis no DebugView.
- [ ] `ga_client_id` na metadata do PaymentIntent (testado ponta a ponta).
- [ ] `purchase` chega ao GA4 via webhook, fire-and-forget, sem tocar no provisionamento.
- [ ] `purchase` (GA4) = `sales_log` = Stripe (1 compra real reconciliada).
- [ ] `begin_checkout` marcado como evento-chave após disparar.

Obrigado pela diligência — a abordagem faseada é exatamente a certa.
