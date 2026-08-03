import type { LayoutConfig } from "@/lib/cms/types";
import type { NavItem } from "@/types";

export type Tab =
  | "brand"
  | "landing"
  | "nav"
  | "copy"
  | "about"
  | "services"
  | "projects";

export const TABS: Array<{ id: Tab; label: string }> = [
  { id: "brand", label: "برند و لینک" },
  { id: "landing", label: "لندینگ" },
  { id: "nav", label: "منو" },
  { id: "copy", label: "هیرو و متن‌ها" },
  { id: "about", label: "درباره من" },
  { id: "services", label: "خدمات" },
  { id: "projects", label: "نمونه‌کارها" },
];

export const SERVICE_ICONS = [
  { value: "architecture", label: "معماری" },
  { value: "server", label: "سرور" },
  { value: "design", label: "طراحی" },
  { value: "git", label: "گیت" },
  { value: "code", label: "کد" },
  { value: "api", label: "API" },
  { value: "Monitor", label: "مانیتور" },
  { value: "Layers", label: "لایه‌ها" },
] as const;

export const PROJECT_CATEGORIES = [
  { value: "web", label: "وب" },
  { value: "saas", label: "SaaS" },
  { value: "api", label: "API" },
  { value: "oss", label: "متن‌باز" },
] as const;

export const CASE_STYLES = [
  { value: "default", label: "پیش‌فرض" },
  { value: "luxury", label: "لوکس" },
  { value: "infra", label: "زیرساخت" },
] as const;

export const SECTION_TO_NAV: Record<string, string> = {
  hero: "home",
  work: "work",
  expertise: "expertise",
  about: "about",
  contact: "contact",
};

export const NAV_ID_LABELS: Record<string, string> = {
  home: "خانه (hero)",
  work: "نمونه‌کارها",
  expertise: "خدمات",
  about: "درباره",
  contact: "تماس",
};

export type ContentPayload<T> = { data: T };

export function getNavIdOptions(layout: LayoutConfig | null): string[] {
  if (!layout?.sections?.length) {
    return ["home", "work", "expertise", "about", "contact"];
  }
  const fromLayout = layout.sections.map((s) => SECTION_TO_NAV[s.id] ?? s.id);
  return [...new Set(["home", ...fromLayout])];
}

export function firstUnusedNavId(
  layout: LayoutConfig | null,
  nav: NavItem[],
): string {
  const used = new Set(nav.map((n) => n.id));
  for (const id of getNavIdOptions(layout)) {
    if (!used.has(id)) return id;
  }
  return `section_${Date.now()}`;
}

export function navHrefForId(id: string): string {
  if (id === "home") return "/";
  return `/#${id}`;
}

export function navIdLabel(id: string): string {
  return NAV_ID_LABELS[id] ?? id;
}
