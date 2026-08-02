-- Independent sellers + product ownership / approval

CREATE TABLE IF NOT EXISTS sellers (
  id text PRIMARY KEY,
  shop_name text NOT NULL,
  owner_name text NOT NULL,
  phone text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  city text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'suspended', 'rejected')),
  is_demo boolean NOT NULL DEFAULT false,
  notes text,
  commission_percent numeric NOT NULL DEFAULT 10,
  joined_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sellers_status ON sellers(status);
CREATE INDEX IF NOT EXISTS idx_sellers_phone ON sellers(phone);
CREATE INDEX IF NOT EXISTS idx_sellers_joined ON sellers(joined_at DESC);

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS seller_id text REFERENCES sellers(id) ON DELETE CASCADE;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'approved'
    CHECK (approval_status IN ('pending', 'approved', 'rejected'));

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS review_note text;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS submitted_at timestamptz;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_approval ON products(approval_status);
CREATE INDEX IF NOT EXISTS idx_products_seller_approval ON products(seller_id, approval_status);

-- Seed demo sellers (password hashes match sellers.json scrypt hashes)
INSERT INTO sellers (
  id, shop_name, owner_name, phone, password_hash, city, status, is_demo, joined_at, commission_percent
) VALUES
  (
    's1',
    'زنبورداری البرز',
    'حسین محمدی',
    '09121111111',
    'scrypt$NDQMuyBRdq7P76kLdlhMuQ$SfXCRHqm8tbFSl0GoWWoO1LeXqJsSf518UvPya-D4x1st9fOvfnFBmvVH9NCYK8zcnHgoCyhmHvRszpLP7_Ihg',
    'کرج',
    'active',
    true,
    '2025-01-10T00:00:00Z',
    10
  ),
  (
    's2',
    'شهد زاگرس',
    'مریم کریمی',
    '09122222222',
    'scrypt$aQh7j2hX3V92VATGRohYsA$Mr6ghcsjPhhvfmfetT8BlS1HPRxqPKEOMxfgxZKs5taXT_5ydbIHAUOSLtGvEUZK9nBPPGB70BB1FEOwENC4cA',
    'شیراز',
    'active',
    true,
    '2025-03-22T00:00:00Z',
    10
  )
ON CONFLICT (id) DO NOTHING;

-- Link seller_sessions.seller_id to sellers when possible (soft FK already via text)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'seller_sessions_seller_id_fkey'
  ) THEN
    ALTER TABLE seller_sessions
      ADD CONSTRAINT seller_sessions_seller_id_fkey
      FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN others THEN
    -- Ignore if orphan sessions exist; sessions can be cleaned manually.
    NULL;
END $$;
