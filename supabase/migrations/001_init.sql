-- Haji Asal e-commerce schema
-- Run in Supabase SQL editor or via CLI

create table if not exists orders (
  id text primary key,
  status text not null default 'pending_payment',
  payment_method text not null default 'cod',
  customer jsonb not null,
  items jsonb not null,
  subtotal integer not null,
  shipping integer not null default 0,
  discount integer not null default 0,
  total integer not null,
  coupon_code text,
  tracking_code text unique,
  shipping_method text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_tracking_code_idx on orders (tracking_code);
create index if not exists orders_status_idx on orders (status);
create index if not exists orders_created_at_idx on orders (created_at desc);

create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  subscribed_at timestamptz not null default now()
);

create table if not exists contact_messages (
  id text primary key,
  name text not null,
  email text not null,
  phone text not null,
  subject text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  author text not null,
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists product_reviews_product_id_idx on product_reviews (product_id);
