"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/types";
import type { HomeSectionId, LayoutConfig } from "@/lib/cms/types";
import { useLayout, useSite } from "@/context/CmsContext";

/** Map nav item ids to homepage section ids for layout filtering. */
const NAV_TO_SECTION: Record<string, HomeSectionId | "always"> = {
  home: "hero",
  work: "work",
  expertise: "expertise",
  about: "about",
  contact: "contact",
};

export function filterNavByLayout(
  nav: NavItem[],
  layout: LayoutConfig,
): NavItem[] {
  const enabled = new Set(
    layout.sections.filter((s) => s.enabled).map((s) => s.id),
  );

  return nav.filter((item) => {
    const section = NAV_TO_SECTION[item.id];
    if (!section || section === "always") return true;
    return enabled.has(section);
  });
}

function hrefForNav(item: NavItem, pathname: string) {
  if (pathname !== "/work") return item.href;
  if (item.id === "home") return "/";
  if (item.id === "work") return "/work";
  if (item.id === "expertise") return "/work#services";
  if (item.id === "about") return "/#about";
  if (item.id === "contact") return "/#contact";
  return item.href;
}

export function useVisibleNav() {
  const site = useSite();
  const layout = useLayout();
  const pathname = usePathname();
  return useMemo(
    () =>
      filterNavByLayout(site.nav, layout).map((item) => ({
        ...item,
        href: hrefForNav(item, pathname),
      })),
    [site.nav, layout, pathname],
  );
}
