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

export type PublicCms = Omit<CmsMap, "leads">;

const writeChains = new Map<string, Promise<unknown>>();

async function withDocLock<T>(doc: CmsDocument, fn: () => Promise<T>): Promise<T> {
  const prev = writeChains.get(doc) ?? Promise.resolve();
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const chained = prev.then(() => gate);
  writeChains.set(doc, chained);
  await prev.catch(() => undefined);
  try {
    return await fn();
  } finally {
    release();
    if (writeChains.get(doc) === chained) writeChains.delete(doc);
  }
}

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

/** Windows-safe atomic replace: write tmp → unlink target → rename. */
async function atomicReplace(target: string, payload: string): Promise<void> {
  const tmp = `${target}.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}.tmp`;
  await fs.writeFile(tmp, payload, { encoding: "utf8" });
  try {
    await fs.rename(tmp, target);
  } catch {
    try {
      await fs.unlink(target);
    } catch {
      /* target may not exist */
    }
    await fs.rename(tmp, target);
  }
}

async function writeJsonUnlocked<T>(doc: CmsDocument, data: T): Promise<void> {
  await ensureDir();
  const target = filePath(doc);
  const payload = `${JSON.stringify(data, null, 2)}\n`;
  await atomicReplace(target, payload);
}

async function writeJsonFile<T>(doc: CmsDocument, data: T): Promise<void> {
  await withDocLock(doc, () => writeJsonUnlocked(doc, data));
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

export async function updateLeads(
  mutator: (leads: Lead[]) => Lead[],
): Promise<Lead[]> {
  return withDocLock("leads", async () => {
    const current = await readJsonFile<Lead[]>("leads", []);
    const next = mutator(current);
    await writeJsonUnlocked("leads", next);
    return next;
  });
}

export async function countNewLeads(): Promise<number> {
  const leads = await getLeads();
  return leads.filter((l) => l.status === "new").length;
}

export async function appendLead(
  lead: Omit<Lead, "id" | "createdAt" | "status"> & {
    projectType?: string;
  },
): Promise<Lead> {
  let created!: Lead;
  await updateLeads((leads) => {
    created = {
      id: `lead_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: lead.name.trim(),
      contact: lead.contact.trim(),
      message: lead.message.trim(),
      projectType: lead.projectType?.trim() || undefined,
      status: "new",
      createdAt: new Date().toISOString(),
    };
    return [created, ...leads];
  });
  return created;
}

/** Public site data — never loads leads (PII). */
export async function getPublicCms(): Promise<PublicCms> {
  const [site, projects, copy, layout] = await Promise.all([
    getSite(),
    getProjects(),
    getCopy(),
    getLayout(),
  ]);
  return { site, projects, copy, layout };
}

export async function getAllCms(): Promise<CmsMap> {
  const [publicCms, leads] = await Promise.all([getPublicCms(), getLeads()]);
  return { ...publicCms, leads };
}

let seedPromise: Promise<void> | null = null;

export async function ensureCmsSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = (async () => {
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
          const raw = await fs.readFile(filePath(doc), "utf8");
          JSON.parse(raw);
        } catch {
          await writeJsonFile(doc, fallback);
        }
      }

      // Backfill cover images for known projects that only had previewUrl
      // (iframes are often blocked on live hosts).
      try {
        const seedById = new Map(
          (fallbackProjects as ProjectItem[]).map((p) => [p.id, p]),
        );
        const current = await readJsonFile(
          "projects",
          fallbackProjects as ProjectItem[],
        );
        let changed = false;
        const next = current.map((p) => {
          if (p.image) return p;
          const seedImage = seedById.get(p.id)?.image;
          if (!seedImage) return p;
          changed = true;
          return { ...p, image: seedImage };
        });
        if (changed) await writeJsonFile("projects", next);
      } catch {
        /* ignore migration failures */
      }
    })().catch((err) => {
      seedPromise = null;
      throw err;
    });
  }
  await seedPromise;
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

export async function restoreCmsFromBackup(data: {
  site?: SiteConfig;
  projects?: ProjectItem[];
  copy?: EditableCopy;
  layout?: LayoutConfig;
  leads?: Lead[];
}): Promise<string[]> {
  const restored: string[] = [];
  if (data.site) {
    await setSite(data.site);
    restored.push("site");
  }
  if (data.projects) {
    await setProjects(data.projects);
    restored.push("projects");
  }
  if (data.copy) {
    await setCopy(data.copy);
    restored.push("copy");
  }
  if (data.layout) {
    await setLayout(data.layout);
    restored.push("layout");
  }
  if (data.leads) {
    await setLeads(data.leads);
    restored.push("leads");
  }
  return restored;
}

export function findUploadReferences(url: string, cms: PublicCms): string[] {
  const refs: string[] = [];
  const hay = JSON.stringify(cms);
  if (!hay.includes(url)) return refs;
  if (JSON.stringify(cms.site).includes(url)) refs.push("site");
  if (JSON.stringify(cms.projects).includes(url)) refs.push("projects");
  if (JSON.stringify(cms.copy).includes(url)) refs.push("copy");
  return refs;
}

function stripUrlFromValue(value: unknown, url: string): unknown {
  if (typeof value === "string") {
    return value === url ? "" : value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => stripUrlFromValue(item, url));
  }
  if (value && typeof value === "object") {
    const next: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(
      value as Record<string, unknown>,
    )) {
      const stripped = stripUrlFromValue(child, url);
      if (
        stripped === "" &&
        (key === "logo" || key === "previewUrl" || key === "visual")
      ) {
        continue;
      }
      next[key] = stripped;
    }
    return next;
  }
  return value;
}

/** Remove a media URL from CMS docs. Returns which docs changed. */
export async function stripUploadReferences(
  url: string,
): Promise<Array<"site" | "projects" | "copy">> {
  const cms = await getPublicCms();
  const changed: Array<"site" | "projects" | "copy"> = [];

  if (JSON.stringify(cms.site).includes(url)) {
    await setSite(stripUrlFromValue(cms.site, url) as SiteConfig);
    changed.push("site");
  }
  if (JSON.stringify(cms.projects).includes(url)) {
    const next = stripUrlFromValue(cms.projects, url) as ProjectItem[];
    const cleaned = next.map((p) => {
      if (!p.image) {
        const { image: _drop, ...rest } = p;
        return rest as ProjectItem;
      }
      return p;
    });
    await setProjects(cleaned);
    changed.push("projects");
  }
  if (JSON.stringify(cms.copy).includes(url)) {
    await setCopy(stripUrlFromValue(cms.copy, url) as EditableCopy);
    changed.push("copy");
  }
  return changed;
}

export { FALLBACK_COPY, FALLBACK_LAYOUT };
