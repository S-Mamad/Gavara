import { promises as fs } from "fs";
import path from "path";
import type { CmsDocument, CmsMap } from "./types";
import fallbackSite from "@/data/site.json";
import fallbackProjects from "@/data/projects.json";
import type { ProjectItem, SiteConfig } from "@/types";
import type { EditableCopy, LayoutConfig, Lead } from "./types";

const CMS_DIR = path.join(process.cwd(), "data", "cms");

const FALLBACK_COPY: EditableCopy = {
  hero: {
    title: "از ایده تا محصول زنده",
    highlight: "با کیفیت پروداکشن",
    description:
      "سایت، فروشگاه و محصول دیجیتال | ربات تلگرام، پنل و اتوماسیون | دیزاین، کد و لانچ در یک تیم",
    primaryCta: "شروع پروژه",
    secondaryCta: "نمونه‌کارها",
  },
  bento: {
    eyebrow: "",
    title: "چه می‌سازیم",
    description: "چهار حوزه اصلی؛ بدون وعده اضافه.",
  },
  work: {
    eyebrow: "",
    title: "نمونه‌کار واقعی",
    description:
      "از پلتفرم سلامت تا فروشگاه لوکس؛ خروجی قابل لمس، نه دموی تزئینی.",
  },
  about: {
    eyebrow: "درباره",
    title: "محمد محمدی",
    description: "فرانت‌اند، محصول و لانچ؛ خروجی واقعی از ایده تا پروداکشن.",
  },
  contact: {
    eyebrow: "",
    title: "همکاری با ما",
    description: "کوتاه بنویس؛ معمولاً همان روز جواب می‌دهیم.",
  },
};

const FALLBACK_LAYOUT: LayoutConfig = {
  sections: [
    { id: "hero", label: "هیرو", enabled: true },
    { id: "work", label: "نمونه‌کارها", enabled: true },
    { id: "expertise", label: "خدمات", enabled: true },
    { id: "about", label: "درباره", enabled: true },
    { id: "contact", label: "تماس", enabled: true },
  ],
};

function filePath(doc: CmsDocument) {
  return path.join(CMS_DIR, `${doc}.json`);
}

async function ensureDir() {
  await fs.mkdir(CMS_DIR, { recursive: true });
}

async function readJsonFile<T>(doc: CmsDocument, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath(doc), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return structuredClone(fallback);
  }
}

async function writeJsonFile<T>(doc: CmsDocument, data: T): Promise<void> {
  await ensureDir();
  const target = filePath(doc);
  const tmp = `${target}.${process.pid}.${Date.now()}.tmp`;
  const payload = `${JSON.stringify(data, null, 2)}\n`;
  await fs.writeFile(tmp, payload, { encoding: "utf8" });
  await fs.rename(tmp, target);
}

export async function getSite(): Promise<SiteConfig> {
  return readJsonFile("site", fallbackSite as SiteConfig);
}

export async function setSite(data: SiteConfig): Promise<void> {
  await writeJsonFile("site", data);
}

export async function getProjects(): Promise<ProjectItem[]> {
  return readJsonFile("projects", fallbackProjects as ProjectItem[]);
}

export async function setProjects(data: ProjectItem[]): Promise<void> {
  await writeJsonFile("projects", data);
}

export async function getCopy(): Promise<EditableCopy> {
  return readJsonFile("copy", FALLBACK_COPY);
}

export async function setCopy(data: EditableCopy): Promise<void> {
  await writeJsonFile("copy", data);
}

export async function getLayout(): Promise<LayoutConfig> {
  return readJsonFile("layout", FALLBACK_LAYOUT);
}

export async function setLayout(data: LayoutConfig): Promise<void> {
  await writeJsonFile("layout", data);
}

export async function getLeads(): Promise<Lead[]> {
  return readJsonFile<Lead[]>("leads", []);
}

export async function setLeads(data: Lead[]): Promise<void> {
  await writeJsonFile("leads", data);
}

export async function appendLead(
  lead: Omit<Lead, "id" | "createdAt" | "status"> & {
    projectType?: string;
  },
): Promise<Lead> {
  const leads = await getLeads();
  const entry: Lead = {
    id: `lead_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: lead.name.trim(),
    contact: lead.contact.trim(),
    message: lead.message.trim(),
    projectType: lead.projectType?.trim() || undefined,
    status: "new",
    createdAt: new Date().toISOString(),
  };
  leads.unshift(entry);
  await setLeads(leads);
  return entry;
}

export async function getAllCms(): Promise<CmsMap> {
  const [site, projects, copy, layout, leads] = await Promise.all([
    getSite(),
    getProjects(),
    getCopy(),
    getLayout(),
    getLeads(),
  ]);
  return { site, projects, copy, layout, leads };
}

export async function ensureCmsSeeded(): Promise<void> {
  await ensureDir();
  const docs: Array<{ doc: CmsDocument; fallback: unknown }> = [
    { doc: "site", fallback: fallbackSite },
    { doc: "projects", fallback: fallbackProjects },
    { doc: "copy", fallback: FALLBACK_COPY },
    { doc: "layout", fallback: FALLBACK_LAYOUT },
    { doc: "leads", fallback: [] },
  ];

  for (const { doc, fallback } of docs) {
    try {
      await fs.access(filePath(doc));
      // Recover if file is empty/corrupt
      const raw = await fs.readFile(filePath(doc), "utf8");
      JSON.parse(raw);
    } catch {
      await writeJsonFile(doc, fallback);
    }
  }
}

export async function resetCmsFromSeed(
  docs: CmsDocument[] = ["site", "projects", "copy", "layout"],
): Promise<void> {
  const map: Partial<Record<CmsDocument, unknown>> = {
    site: fallbackSite,
    projects: fallbackProjects,
    copy: FALLBACK_COPY,
    layout: FALLBACK_LAYOUT,
    leads: [],
  };
  for (const doc of docs) {
    if (map[doc] !== undefined) await writeJsonFile(doc, map[doc]);
  }
}
