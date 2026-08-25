import { z } from "zod";

const nonEmpty = (max: number) => z.string().trim().min(1).max(max);
const optionalUrl = z
  .string()
  .trim()
  .max(2000)
  .refine(
    (v) =>
      !v ||
      v.startsWith("/") ||
      v.startsWith("https://") ||
      v.startsWith("http://") ||
      v.startsWith("mailto:") ||
      v.startsWith("tel:") ||
      v.startsWith("#"),
    { message: "آدرس نامعتبر است." },
  );

const hexColor = z
  .string()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/, "رنگ نامعتبر");

const homeSectionId = z.enum([
  "hero",
  "work",
  "expertise",
  "about",
  "contact",
]);

export const leadStatusSchema = z.enum(["new", "read", "archived"]);

export const layoutSchema = z.object({
  sections: z
    .array(
      z.object({
        id: homeSectionId,
        label: nonEmpty(80),
        enabled: z.boolean(),
      }),
    )
    .min(1)
    .refine((sections) => sections.some((s) => s.enabled), {
      message: "حداقل یک سکشن باید فعال باشد.",
    }),
});

const sectionCopySchema = z.object({
  eyebrow: z.string().max(120).optional().default(""),
  title: nonEmpty(200),
  description: z.string().max(2000).default(""),
});

export const copySchema = z.object({
  hero: z.object({
    title: nonEmpty(200),
    highlight: z.string().max(200).default(""),
    description: z.string().max(2000).default(""),
    primaryCta: nonEmpty(80),
    secondaryCta: nonEmpty(80),
  }),
  bento: sectionCopySchema,
  work: sectionCopySchema,
  about: sectionCopySchema,
  contact: sectionCopySchema,
});

const navItemSchema = z.object({
  id: nonEmpty(64),
  label: nonEmpty(80),
  href: nonEmpty(500),
});

const serviceSchema = z.object({
  id: nonEmpty(64),
  index: z.string().max(16).optional(),
  title: nonEmpty(120),
  description: z.string().max(2000).default(""),
  icon: nonEmpty(64),
  span: z.enum(["wide", "tall", "default"]).optional(),
  tags: z.array(z.string().max(64)).max(20).optional(),
  proof: z.string().max(200).optional(),
  visual: z.string().max(200).optional(),
  gradient: z.tuple([hexColor, hexColor]).optional(),
});

const teamMemberSchema = z.object({
  id: nonEmpty(64),
  name: nonEmpty(120),
  role: z.string().max(120).default(""),
  bio: z.string().max(4000).default(""),
  image: z.string().max(1000).default(""),
  imagePosition: z.string().max(80).optional(),
  featured: z.boolean().optional(),
  links: z
    .object({
      github: z.string().max(500).optional(),
      linkedin: z.string().max(500).optional(),
      telegram: z.string().max(500).optional(),
    })
    .optional(),
  initials: z.string().max(8).optional(),
});

const linkItemSchema = z.object({
  id: nonEmpty(64),
  label: nonEmpty(80),
  href: nonEmpty(500),
});

const clientSchema = z.object({
  name: nonEmpty(120),
  href: optionalUrl.optional(),
  logo: z.string().max(1000).optional(),
});

const whyPointSchema = z.object({
  pain: nonEmpty(300),
  answer: nonEmpty(1000),
});

export const siteSchema = z.object({
  brand: z.object({
    name: nonEmpty(80),
    suffix: z.string().max(40).default(""),
    slug: nonEmpty(80),
    version: z.string().max(40).default(""),
    tagline: z.string().max(200).default(""),
    description: z.string().max(2000).default(""),
    heroTitle: z.string().max(200).default(""),
    heroHighlight: z.string().max(200).default(""),
  }),
  nav: z.array(navItemSchema).max(20),
  footerNav: z.array(navItemSchema).max(20).optional(),
  stack: z.array(z.string().max(64)).max(40).default([]),
  services: z.array(serviceSchema).max(40),
  team: z.array(teamMemberSchema).min(1).max(20),
  links: z.array(linkItemSchema).max(30),
  heroCta: z
    .object({
      primary: nonEmpty(80),
      secondary: nonEmpty(80),
    })
    .optional(),
  heroStats: z
    .array(
      z.object({
        value: nonEmpty(40),
        label: nonEmpty(80),
      }),
    )
    .max(12)
    .optional(),
  clients: z.array(clientSchema).max(40).optional(),
  whyPoints: z.array(whyPointSchema).max(20).optional(),
});

export const projectSchema = z.object({
  id: nonEmpty(64),
  title: nonEmpty(160),
  description: z.string().max(4000).default(""),
  tag: nonEmpty(120),
  href: nonEmpty(2000),
  gradient: z.tuple([hexColor, hexColor]),
  category: z.enum(["web", "saas", "api", "oss"]),
  tech: z.array(z.string().max(64)).max(30).default([]),
  image: z.string().max(2000).optional(),
  imagePosition: z.string().max(80).optional(),
  previewUrl: optionalUrl.optional().or(z.literal("")),
  preferLivePreview: z.boolean().optional(),
  metrics: z.array(z.string().max(120)).max(20).optional(),
  featured: z.boolean().optional(),
  year: z.string().max(40).optional(),
  comingSoon: z.boolean().optional(),
  caseStyle: z.enum(["luxury", "infra", "default"]).optional(),
  businessValue: z.array(z.string().max(120)).max(20).optional(),
});

export const projectsSchema = z.array(projectSchema).max(100);

export const leadSchema = z.object({
  id: nonEmpty(80),
  name: nonEmpty(120),
  contact: nonEmpty(200),
  message: nonEmpty(8000),
  projectType: z.string().max(120).optional(),
  status: leadStatusSchema,
  createdAt: z.string().min(1).max(64),
});

export const leadsSchema = z.array(leadSchema).max(5000);

export const backupRestoreSchema = z.object({
  site: siteSchema.optional(),
  projects: projectsSchema.optional(),
  copy: copySchema.optional(),
  layout: layoutSchema.optional(),
  leads: leadsSchema.optional(),
  exportedAt: z.string().optional(),
});

export function zodErrorMessage(err: z.ZodError): string {
  const first = err.issues[0];
  if (!first) return "داده نامعتبر است.";
  const path = first.path.length ? first.path.join(".") : "root";
  return `${path}: ${first.message}`;
}
