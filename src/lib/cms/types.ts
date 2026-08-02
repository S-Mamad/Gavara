import type { LandingCopy, SectionCopy } from "@/content/copy";
import type { ProjectItem, SiteConfig } from "@/types";

export type HomeSectionId =
  | "hero"
  | "work"
  | "expertise"
  | "about"
  | "contact";

export interface LayoutSection {
  id: HomeSectionId;
  label: string;
  enabled: boolean;
}

export interface LayoutConfig {
  sections: LayoutSection[];
}

export interface EditableCopy {
  hero: LandingCopy["hero"];
  bento: SectionCopy;
  work: SectionCopy;
  about: SectionCopy;
  contact: SectionCopy;
}

export type LeadStatus = "new" | "read" | "archived";

export interface Lead {
  id: string;
  name: string;
  contact: string;
  message: string;
  projectType?: string;
  status: LeadStatus;
  createdAt: string;
}

export type CmsDocument =
  | "site"
  | "projects"
  | "copy"
  | "layout"
  | "leads";

export type CmsMap = {
  site: SiteConfig;
  projects: ProjectItem[];
  copy: EditableCopy;
  layout: LayoutConfig;
  leads: Lead[];
};
