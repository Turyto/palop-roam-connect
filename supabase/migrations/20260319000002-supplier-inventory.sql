-- Supplier inventory sync runs: one row per sync attempt per supplier
CREATE TABLE public.supplier_inventory_syncs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_name TEXT NOT NULL,
  started_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at  TIMESTAMPTZ,
  status        TEXT NOT NULL DEFAULT 'running'
                  CHECK (status IN ('running', 'completed', 'failed')),
  items_fetched INTEGER,
  error_message TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Supplier inventory items: one row per eSIM held in a supplier account
-- Upsert key: (supplier_name, supplier_item_id)
CREATE TABLE public.supplier_inventory_items (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_name         TEXT NOT NULL,
  supplier_item_id      TEXT NOT NULL,        -- esimTranNo (eSIM Access), or equivalent
  supplier_package_code TEXT,                 -- packageCode from supplier
  package_name          TEXT,                 -- human-readable package name from supplier
  iccid                 TEXT,
  lpa_code              TEXT,
  -- Normalized status; derived from supplier activeType at sync time
  -- See STATUS MAPPING section in sync-supplier-inventory/index.ts
  status                TEXT NOT NULL
                          CHECK (status IN ('available', 'active', 'expired', 'disabled')),
  is_sellable           BOOLEAN NOT NULL DEFAULT FALSE,  -- true only when status='available'
  -- Optional: plan match, populated at sync time via esim_packages table lookup
  matched_plan_id       TEXT,                -- esim_packages.plan_id (text slug)
  matched_plan_name     TEXT,                -- esim_packages.plan_name
  -- Data usage
  total_bytes           BIGINT,
  remaining_bytes       BIGINT,
  usage_bytes           BIGINT,
  -- Timestamps from supplier
  activated_at          TIMESTAMPTZ,
  expires_at            TIMESTAMPTZ,
  created_at_supplier   TIMESTAMPTZ,
  -- Full raw response row from supplier for future-proofing
  raw_payload           JSONB NOT NULL DEFAULT '{}',
  sync_id               UUID REFERENCES public.supplier_inventory_syncs(id),
  last_synced_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (supplier_name, supplier_item_id)
);

-- Triggers for updated_at
CREATE TRIGGER update_supplier_inventory_items_updated_at
  BEFORE UPDATE ON public.supplier_inventory_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS: admin-only for both tables
ALTER TABLE public.supplier_inventory_syncs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage supplier inventory syncs"
  ON public.supplier_inventory_syncs FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::app_role
  ));

CREATE POLICY "Admins can manage supplier inventory items"
  ON public.supplier_inventory_items FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::app_role
  ));

-- Index for common query patterns
CREATE INDEX idx_supplier_inventory_items_supplier ON public.supplier_inventory_items(supplier_name);
CREATE INDEX idx_supplier_inventory_items_status ON public.supplier_inventory_items(status);
CREATE INDEX idx_supplier_inventory_items_sellable ON public.supplier_inventory_items(is_sellable);
CREATE INDEX idx_supplier_inventory_items_matched ON public.supplier_inventory_items(matched_plan_id);
CREATE INDEX idx_supplier_inventory_syncs_supplier ON public.supplier_inventory_syncs(supplier_name);
