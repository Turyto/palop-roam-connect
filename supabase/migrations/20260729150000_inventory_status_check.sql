-- Allow the granular expired statuses the sync function and admin UI already use.
ALTER TABLE public.supplier_inventory_items DROP CONSTRAINT IF EXISTS supplier_inventory_items_status_check;
ALTER TABLE public.supplier_inventory_items ADD CONSTRAINT supplier_inventory_items_status_check
  CHECK (status IN ('available', 'active', 'expired', 'expired_used', 'expired_unused', 'disabled'));
