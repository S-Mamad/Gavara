-- Customer auth: profiles, addresses, wishlists, OTP challenges, orders.user_id

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  phone text unique not null,
  full_name text,
  email text,
  newsletter_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_phone_idx on profiles (phone);

create table if not exists user_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  label text,
  province text not null,
  city text not null,
  address text not null,
  postal_code text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists user_addresses_user_id_idx on user_addresses (user_id);

create table if not exists user_wishlists (
  user_id uuid not null references profiles(id) on delete cascade,
  product_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table if not exists otp_challenges (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists otp_challenges_phone_idx on otp_challenges (phone, created_at desc);

alter table orders add column if not exists user_id uuid references profiles(id);
create index if not exists orders_user_id_idx on orders (user_id);

alter table product_reviews add column if not exists user_id uuid references profiles(id);
