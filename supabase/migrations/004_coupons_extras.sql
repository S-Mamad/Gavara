-- Coupon extras for storefront labels and percent caps
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS max_discount numeric;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS label text;
