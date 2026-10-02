export const PROJECT_TYPES = [
  { value: "mvp", label: "محصول جدید" },
  { value: "frontend", label: "فرانت‌اند" },
  { value: "infra", label: "زیرساخت" },
  { value: "shop", label: "فروشگاه" },
] as const;

export function resolveProjectType(service: string | null | undefined): string {
  const value = service?.trim();
  if (!value) return "mvp";
  const match = PROJECT_TYPES.find(
    (chip) => chip.value === value || chip.label === value,
  );
  return match?.value ?? value;
}

export function projectTypeLabel(value: string | undefined | null): string {
  if (!value) return "";
  return PROJECT_TYPES.find((item) => item.value === value)?.label ?? value;
}

export function normalizeDigits(value: string): string {
  const persian = "۰۱۲۳۴۵۶۷۸۹";
  const arabic = "٠١٢٣٤٥٦٧٨٩";
  return value
    .replace(/[۰-۹]/g, (digit) => String(persian.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String(arabic.indexOf(digit)))
    .replace(/[\s()-]/g, "");
}

/** Iranian mobile, with or without 0 / +98, Persian digits allowed. */
export function isIranMobile(value: string): boolean {
  const normalized = normalizeDigits(value.trim());
  return /^(?:\+98|0098|98|0)?9\d{9}$/.test(normalized);
}
