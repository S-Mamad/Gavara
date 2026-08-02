"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import type { LandingCopy } from "@/content/copy";
import type { LayoutConfig } from "@/lib/cms/types";
import type { ProjectItem, SiteConfig } from "@/types";
import { copyByMode } from "@/content/copy";
import fallbackSite from "@/data/site.json";
import fallbackProjects from "@/data/projects.json";

export interface CmsContextValue {
  site: SiteConfig;
  projects: ProjectItem[];
  copy: LandingCopy;
  layout: LayoutConfig;
}

const defaultLayout: LayoutConfig = {
  sections: [
    { id: "hero", label: "هیرو", enabled: true },
    { id: "work", label: "نمونه‌کارها", enabled: true },
    { id: "expertise", label: "خدمات", enabled: true },
    { id: "about", label: "درباره", enabled: true },
    { id: "contact", label: "تماس", enabled: true },
  ],
};

const CmsContext = createContext<CmsContextValue>({
  site: fallbackSite as SiteConfig,
  projects: fallbackProjects as ProjectItem[],
  copy: copyByMode.dev,
  layout: defaultLayout,
});

export function CmsProvider({
  value,
  children,
}: {
  value: CmsContextValue;
  children: ReactNode;
}) {
  return <CmsContext.Provider value={value}>{children}</CmsContext.Provider>;
}

export function useCms() {
  return useContext(CmsContext);
}

export function useSite() {
  return useCms().site;
}

export function useProjects() {
  return useCms().projects;
}

export function useLayout() {
  return useCms().layout;
}
