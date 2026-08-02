-- Seller panel sessions (mirrors admin_sessions)

CREATE TABLE IF NOT EXISTS seller_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id text NOT NULL,
  token_hash text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_seller_sessions_token ON seller_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_seller_sessions_seller ON seller_sessions(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_sessions_expires ON seller_sessions(expires_at);
