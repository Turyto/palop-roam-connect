---
name: eSIM provisioning recovery & write-back
description: How to reliably match a supplier-provisioned eSIM back to our order, and why provisioning writes must happen server-side.
---

# eSIM provisioning — recovery key & server-side write-back

## Reliable join key for orphaned/failed orders
When a paid order is provisioned by the supplier (eSIM Access) but our DB never stored the ICCID, do NOT rely on `orders.esim_order_id` — it is frequently NULL precisely for the orders that failed mid-flow.

The authoritative link is the Stripe PaymentIntent, which we send to the supplier as `transactionId`/`outOrder`:

```
supplier_inventory_items.raw_payload->>'transactionId'  ==  orders.payment_intent_id
```

This is 1:1 and unique per order. The supplier row also carries the real `iccid`, `ac` (LPA code), `shortUrl`, `qrCodeUrl`, and `expiredTime` in `raw_payload`, plus a top-level `order_no`/`esim_status` (`GOT_RESOURCE` = provisioned). Backfill `esim_activations` + `qr_codes` from this mapping, then flip `orders.esim_status` to `provisioned` only when the activation ICCID equals the supplier ICCID.

**Why:** matching by timestamp or email is fuzzy and risks handing one customer another customer's eSIM. The PaymentIntent is the only safe key.

## The off-by-one ICCID bug (root cause for server-side write)
The old client-side write path could assign the WRONG ICCID to an order — observed as a one-row shift (order N's activation holding order N-1's ICCID). Cause: client resolved/wrote credentials after provisioning, vulnerable to races and client drops.

**Fix / rule:** the edge function (`esim-access`, create-order path) is the authoritative writer — it persists `esim_activations`/`qr_codes` and PATCHes `orders` via service role immediately after the supplier returns credentials, gated on a resolved ICCID. The client write remains only as an existence-checked fallback (insert only if no row exists), so it can never overwrite or duplicate the server's row.

## Service-role writes need an ownership check
Any edge function that writes with the service role based on an `orderId` from the request body MUST first verify the order belongs to the authenticated user (`user.id` from the verified token, not a body field). Otherwise a caller could write credentials onto someone else's order.
