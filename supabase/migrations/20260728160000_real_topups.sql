-- Task: make top-ups real (Stripe charge + eSIM Access fulfilment)
-- 1) Track supplier coverage region on packages so top-up options can be matched.
ALTER TABLE esim_packages ADD COLUMN IF NOT EXISTS location_code text;

UPDATE esim_packages SET location_code = CASE
  WHEN esim_access_package_id IN ('PRC8B6GK2','PV0Q6PZ7G','P29FDU5TL','P6PBYX5G4') THEN 'EU-35'
  WHEN esim_access_package_id IN ('PV048NCRG','P50GVS8GN','PHC4X21NC') THEN 'EU-30'
  WHEN esim_access_package_id IN ('CKH980','CKH986','CKH1002','CKH1003','CKH1004','CKH1011') THEN 'PT'
  WHEN esim_access_package_id IN ('PWUJG82CJ','CKH301','CKH317','CKH333','CKH349','CKH860') THEN 'BR'
  WHEN esim_access_package_id IN ('P1OKIKO93','PO7O41OJI') THEN 'AO'
  WHEN esim_access_package_id IN ('CKH378','CKH407','CKH436','CKH465') THEN 'GW'
  WHEN esim_access_package_id LIKE 'MB0%' THEN 'ZA'
  ELSE location_code END
WHERE supplier = 'esim_access' OR esim_access_package_id IS NOT NULL;

-- 2) Top-up options become real supplier top-up packages (verified against live catalog 2026-07-28).
ALTER TABLE topup_options
  ADD COLUMN IF NOT EXISTS supplier_package_code text,
  ADD COLUMN IF NOT EXISTS location_code text,
  ADD COLUMN IF NOT EXISTS wholesale_cost numeric,
  ADD COLUMN IF NOT EXISTS wholesale_currency text NOT NULL DEFAULT 'USD';

-- Deactivate old placeholder options (never linked to a real supplier package).
UPDATE topup_options SET is_active = false WHERE supplier_package_code IS NULL;

INSERT INTO topup_options (type, name, description, data_amount, validity_days, price, currency, is_active, sort_order, supplier_package_code, location_code, wholesale_cost)
VALUES
  -- Portugal
  ('data','+1 GB · 7 dias',NULL,'1GB',7,  2.90,'EUR',true,10,'TOPUP_CKH1002','PT',0.57),
  ('data','+3 GB · 15 dias',NULL,'3GB',15, 4.90,'EUR',true,11,'TOPUP_CKH1003','PT',1.50),
  ('data','+5 GB · 30 dias',NULL,'5GB',30, 7.90,'EUR',true,12,'TOPUP_CKH986','PT',3.40),
  ('data','+10 GB · 30 dias',NULL,'10GB',30, 9.90,'EUR',true,13,'TOPUP_CKH1004','PT',4.28),
  -- Europe (35 areas)
  ('data','+1 GB · 7 dias',NULL,'1GB',7,  2.90,'EUR',true,20,'TOPUP_P7QP3XCU9','EU-35',0.62),
  ('data','+3 GB · 15 dias',NULL,'3GB',15, 4.90,'EUR',true,21,'TOPUP_PY6QZ2KF3','EU-35',1.64),
  ('data','+5 GB · 30 dias',NULL,'5GB',30, 6.90,'EUR',true,22,'TOPUP_PQ7F50RKG','EU-35',2.73),
  ('data','+10 GB · 30 dias',NULL,'10GB',30,11.90,'EUR',true,23,'TOPUP_PD45NDK0Z','EU-35',5.67),
  -- Europe (30+ areas)
  ('data','+1 GB · 7 dias',NULL,'1GB',7,  3.90,'EUR',true,30,'TOPUP_W962SFTU','EU-30',1.00),
  ('data','+3 GB · 15 dias',NULL,'3GB',15, 7.90,'EUR',true,31,'TOPUP_PVV045461','EU-30',3.70),
  ('data','+5 GB · 30 dias',NULL,'5GB',30,11.90,'EUR',true,32,'TOPUP_G6PBT7M5','EU-30',5.70),
  ('data','+10 GB · 30 dias',NULL,'10GB',30,19.90,'EUR',true,33,'TOPUP_VV8ZRK17','EU-30',9.90),
  -- Brazil
  ('data','+1 GB · 7 dias',NULL,'1GB',7,  3.90,'EUR',true,40,'TOPUP_CKH301','BR',1.28),
  ('data','+3 GB · 15 dias',NULL,'3GB',15, 7.90,'EUR',true,41,'TOPUP_CKH317','BR',3.85),
  ('data','+5 GB · 30 dias',NULL,'5GB',30,12.90,'EUR',true,42,'TOPUP_CKH333','BR',6.42),
  ('data','+10 GB · 30 dias',NULL,'10GB',30,22.90,'EUR',true,43,'TOPUP_CKH349','BR',11.40),
  -- Angola
  ('data','+1 GB · 7 dias',NULL,'1GB',7, 14.90,'EUR',true,50,'TOPUP_INO67E58','AO',9.33),
  ('data','+3 GB · 15 dias',NULL,'3GB',15,34.90,'EUR',true,51,'TOPUP_ZVBE0Y6U','AO',24.88),
  ('data','+5 GB · 30 dias',NULL,'5GB',30,54.90,'EUR',true,52,'TOPUP_B14ZLEGS','AO',41.47),
  -- Guinea-Bissau
  ('data','+1 GB · 7 dias',NULL,'1GB',7,  7.90,'EUR',true,60,'TOPUP_CKH378','GW',4.30),
  ('data','+3 GB · 15 dias',NULL,'3GB',15,16.90,'EUR',true,61,'TOPUP_CKH407','GW',11.47),
  ('data','+5 GB · 30 dias',NULL,'5GB',30,24.90,'EUR',true,62,'TOPUP_CKH436','GW',19.12),
  -- South Africa
  ('data','+1 GB · 7 dias',NULL,'1GB',7,  3.90,'EUR',true,70,'TOPUP_MB026','ZA',1.25),
  ('data','+3 GB · 15 dias',NULL,'3GB',15, 6.90,'EUR',true,71,'TOPUP_MB031','ZA',3.32),
  ('data','+5 GB · 30 dias',NULL,'5GB',30, 8.90,'EUR',true,72,'TOPUP_MB036','ZA',5.54),
  ('data','+10 GB · 30 dias',NULL,'10GB',30,17.90,'EUR',true,73,'TOPUP_MB041','ZA',10.11);

-- 3) topup_orders: payment + fulfilment tracking columns
ALTER TABLE topup_orders
  ADD COLUMN IF NOT EXISTS topup_option_id uuid REFERENCES topup_options(id),
  ADD COLUMN IF NOT EXISTS supplier_package_code text,
  ADD COLUMN IF NOT EXISTS iccid text,
  ADD COLUMN IF NOT EXISTS supplier_order_no text,
  ADD COLUMN IF NOT EXISTS failure_reason text;

ALTER TABLE topup_orders DROP CONSTRAINT IF EXISTS topup_orders_status_check;
ALTER TABLE topup_orders ADD CONSTRAINT topup_orders_status_check
  CHECK (status = ANY (ARRAY['pending','processing','completed','failed','cancelled']));

CREATE UNIQUE INDEX IF NOT EXISTS topup_orders_payment_intent_id_uniq
  ON topup_orders(payment_intent_id) WHERE payment_intent_id IS NOT NULL;

-- 4) Cancel old simulated pending rows (never charged, never fulfilled).
UPDATE topup_orders SET status = 'cancelled', payment_status = 'cancelled', updated_at = now()
WHERE payment_intent_id IS NULL AND status = 'pending';
