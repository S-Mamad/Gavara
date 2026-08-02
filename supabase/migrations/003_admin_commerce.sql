-- Admin sessions, audit, login rate limit, commerce tables

-- Admin auth
CREATE TABLE IF NOT EXISTS admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  ip_address text,
  user_agent text
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);

CREATE TABLE IF NOT EXISTS admin_login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  attempted_at timestamptz NOT NULL DEFAULT now(),
  success boolean NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_admin_login_ip ON admin_login_attempts(ip_address, attempted_at DESC);

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  entity_type text,
  entity_id text,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_created ON admin_audit_log(created_at DESC);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id text PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  image text,
  description text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Products (DB-backed, seeded from JSON)
CREATE TABLE IF NOT EXISTS products (
  id text PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  short_description text,
  description text,
  category_id text REFERENCES categories(id),
  images jsonb NOT NULL DEFAULT '[]',
  weight_options jsonb NOT NULL DEFAULT '[]',
  discount_price numeric,
  in_stock boolean NOT NULL DEFAULT true,
  featured boolean NOT NULL DEFAULT false,
  bestseller boolean NOT NULL DEFAULT false,
  rating numeric DEFAULT 0,
  review_count int DEFAULT 0,
  seo jsonb DEFAULT '{}',
  honey_meta jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);

-- Coupons
CREATE TABLE IF NOT EXISTS coupons (
  code text PRIMARY KEY,
  type text NOT NULL CHECK (type IN ('percent', 'fixed')),
  value numeric NOT NULL,
  min_order numeric NOT NULL DEFAULT 0,
  max_uses int,
  used_count int NOT NULL DEFAULT 0,
  expires_at timestamptz,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Inventory logs
CREATE TABLE IF NOT EXISTS inventory_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text NOT NULL REFERENCES products(id),
  variant_key text,
  delta int NOT NULL,
  reason text,
  admin_note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Site settings (key-value)
CREATE TABLE IF NOT EXISTS site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Contact messages extensions
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS source text DEFAULT 'hajiasal';
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS read_at timestamptz;
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS replied_at timestamptz;
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS admin_note text;

-- Orders extensions
ALTER TABLE orders ADD COLUMN IF NOT EXISTS admin_note text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status_timeline jsonb DEFAULT '[]';

-- Reviews moderation
ALTER TABLE product_reviews ADD COLUMN IF NOT EXISTS approved boolean DEFAULT false;
ALTER TABLE product_reviews ADD COLUMN IF NOT EXISTS admin_reply text;
