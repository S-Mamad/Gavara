"use client";

import { useCallback, useEffect, useState } from "react";
import type { EditableCopy } from "@/lib/cms/types";
import type {
  NavItem,
  ProjectItem,
  ServiceItem,
  SiteConfig,
  TeamMember,
} from "@/types";
import { useToast } from "@/components/ui/Toast";
import {
  AdminButton,
  AdminCard,
  AdminCheckbox,
  AdminErrorState,
  AdminField,
  AdminLinkButton,
  AdminPageHeader,
  adminInputClass,
  adminSelectClass,
  adminTextareaClass,
} from "@/components/admin/ui";
import { adminFetch, adminFetchJson, errorMessage } from "@/lib/admin/fetchJson";
import { cn } from "@/lib/utils";

type Tab = "brand" | "nav" | "copy" | "about" | "services" | "projects";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "brand", label: "برند و لینک" },
  { id: "nav", label: "منو" },
  { id: "copy", label: "هیرو و متن‌ها" },
  { id: "about", label: "درباره من" },
  { id: "services", label: "خدمات" },
  { id: "projects", label: "نمونه‌کارها" },
];

const SERVICE_ICONS = [
  { value: "architecture", label: "معماری" },
  { value: "server", label: "سرور" },
  { value: "design", label: "طراحی" },
  { value: "git", label: "گیت" },
  { value: "code", label: "کد" },
  { value: "api", label: "API" },
  { value: "Monitor", label: "مانیتور" },
  { value: "Layers", label: "لایه‌ها" },
] as const;

const PROJECT_CATEGORIES = [
  { value: "web", label: "وب" },
  { value: "saas", label: "SaaS" },
  { value: "api", label: "API" },
  { value: "oss", label: "متن‌باز" },
] as const;

const CASE_STYLES = [
  { value: "default", label: "پیش‌فرض" },
  { value: "luxury", label: "لوکس" },
  { value: "infra", label: "زیرساخت" },
] as const;

type ContentPayload<T> = { data: T };

export default function AdminContentPage() {
  const { pushToast } = useToast();
  const [tab, setTab] = useState<Tab>("brand");
  const [site, setSite] = useState<SiteConfig | null>(null);
  const [copy, setCopy] = useState<EditableCopy | null>(null);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [siteRes, copyRes, projectsRes] = await Promise.all([
        adminFetchJson<ContentPayload<SiteConfig>>("/api/admin/content?doc=site"),
        adminFetchJson<ContentPayload<EditableCopy>>(
          "/api/admin/content?doc=copy",
        ),
        adminFetchJson<ContentPayload<ProjectItem[]>>(
          "/api/admin/content?doc=projects",
        ),
      ]);
      if (!siteRes.data || !copyRes.data) {
        throw new Error("داده محتوا ناقص است.");
      }
      setSite(siteRes.data);
      setCopy(copyRes.data);
      setProjects(projectsRes.data ?? []);
    } catch (err) {
      setSite(null);
      setCopy(null);
      setError(errorMessage(err, "محتوا بارگذاری نشد."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save(doc: string, data: unknown) {
    setSaving(true);
    try {
      await adminFetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ doc, data }),
      });
      pushToast("ذخیره شد.", "success");
    } catch (err) {
      pushToast(errorMessage(err, "خطا در ذخیره."), "error");
    } finally {
      setSaving(false);
    }
  }

  /** Keep header/contact links and About socials in sync. */
  function syncSiteLinksToTeam(next: SiteConfig): SiteConfig {
    const member = next.team[0];
    if (!member) return next;
    const telegram = next.links.find((l) => l.id === "telegram")?.href ?? "";
    const github = next.links.find((l) => l.id === "github")?.href ?? "";
    return {
      ...next,
      team: [
        {
          ...member,
          links: {
            ...member.links,
            telegram,
            github,
          },
        },
      ],
    };
  }

  function syncTeamToSiteLinks(next: SiteConfig): SiteConfig {
    const member = next.team[0];
    if (!member) return next;
    const telegram = member.links?.telegram ?? "";
    const github = member.links?.github ?? "";
    return {
      ...next,
      links: next.links.map((link) => {
        if (link.id === "telegram") return { ...link, href: telegram };
        if (link.id === "github") return { ...link, href: github };
        return link;
      }),
    };
  }

  async function saveSite(next: SiteConfig, mode: "brand" | "about" | "other") {
    const payload =
      mode === "about"
        ? syncTeamToSiteLinks(next)
        : mode === "brand"
          ? syncSiteLinksToTeam(next)
          : next;
    setSaving(true);
    try {
      await adminFetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ doc: "site", data: payload }),
      });
      setSite(payload);
      pushToast("ذخیره شد.", "success");
    } catch (err) {
      pushToast(errorMessage(err, "خطا در ذخیره."), "error");
    } finally {
      setSaving(false);
    }
  }

  async function upload(file: File): Promise<string | null> {
    const body = new FormData();
    body.append("file", file);
    try {
      const res = await adminFetch("/api/admin/upload", {
        method: "POST",
        body,
      });
      const json = (await res.json()) as { url?: string };
      return json.url ?? null;
    } catch (err) {
      pushToast(errorMessage(err, "آپلود ناموفق بود."), "error");
      return null;
    }
  }

  function moveProject(index: number, dir: -1 | 1) {
    setProjects((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      const tmp = next[index]!;
      next[index] = next[target]!;
      next[target] = tmp;
      return next;
    });
  }

  function moveNav(index: number, dir: -1 | 1) {
    if (!site) return;
    const next = [...site.nav];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    const tmp = next[index]!;
    next[index] = next[target]!;
    next[target] = tmp;
    setSite({ ...site, nav: next });
  }

  if (loading) {
    return <p className="text-muted">در حال بارگذاری محتوا...</p>;
  }

  if (error || !site || !copy) {
    return (
      <AdminErrorState
        message={error || "محتوا در دسترس نیست."}
        onRetry={load}
      />
    );
  }

  const member: TeamMember = site.team[0] ?? {
    id: "mohammad",
    name: "",
    role: "",
    bio: "",
    image: "",
  };

  return (
    <div>
      <AdminPageHeader
        title="محتوا"
        description="متن‌ها، منو، درباره، خدمات و نمونه‌کارها را بدون کدنویسی مدیریت کن."
        actions={
          <AdminLinkButton href="/" target="_blank" variant="outline">
            پیش‌نمایش سایت
          </AdminLinkButton>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs transition-colors",
              tab === t.id
                ? "bg-accent text-void"
                : "border border-white/10 text-muted hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "brand" ? (
        <div className="grid max-w-2xl gap-4">
          <AdminCard className="grid gap-4">
            <AdminField label="نام برند">
              <input
                className={adminInputClass}
                value={site.brand.name}
                onChange={(e) =>
                  setSite({
                    ...site,
                    brand: { ...site.brand, name: e.target.value },
                  })
                }
              />
            </AdminField>
            <AdminField label="پسوند">
              <input
                className={adminInputClass}
                value={site.brand.suffix}
                onChange={(e) =>
                  setSite({
                    ...site,
                    brand: { ...site.brand, suffix: e.target.value },
                  })
                }
              />
            </AdminField>
            <AdminField label="اسلاگ" hint="برای مسیرها و نمایش فنی">
              <input
                className={adminInputClass}
                dir="ltr"
                value={site.brand.slug}
                onChange={(e) =>
                  setSite({
                    ...site,
                    brand: { ...site.brand, slug: e.target.value },
                  })
                }
              />
            </AdminField>
            <AdminField label="تگ‌لاین" hint="زیر نام برند در هیرو و فوتر">
              <input
                className={adminInputClass}
                value={site.brand.tagline}
                onChange={(e) =>
                  setSite({
                    ...site,
                    brand: { ...site.brand, tagline: e.target.value },
                  })
                }
              />
            </AdminField>
            <AdminField
              label="توضیح سایت"
              hint="برای JSON-LD و معرفی کوتاه برند"
            >
              <textarea
                className={adminTextareaClass}
                rows={3}
                value={site.brand.description}
                onChange={(e) =>
                  setSite({
                    ...site,
                    brand: { ...site.brand, description: e.target.value },
                  })
                }
              />
            </AdminField>
          </AdminCard>
          {site.links.map((link, i) => (
            <AdminCard key={link.id} className="grid gap-3 sm:grid-cols-2">
              <AdminField label={`برچسب (${link.id})`}>
                <input
                  className={adminInputClass}
                  value={link.label}
                  onChange={(e) => {
                    const links = [...site.links];
                    links[i] = { ...link, label: e.target.value };
                    setSite({ ...site, links });
                  }}
                />
              </AdminField>
              <AdminField label="لینک">
                <input
                  className={adminInputClass}
                  dir="ltr"
                  value={link.href}
                  onChange={(e) => {
                    const links = [...site.links];
                    links[i] = { ...link, href: e.target.value };
                    setSite({ ...site, links });
                  }}
                />
              </AdminField>
            </AdminCard>
          ))}
          <AdminButton
            type="button"
            disabled={saving}
            onClick={() => saveSite(site, "brand")}
          >
            ذخیره برند و لینک‌ها
          </AdminButton>
        </div>
      ) : null}

      {tab === "nav" ? (
        <div className="max-w-2xl space-y-3">
          <p className="text-xs leading-6 text-dim">
            شناسه منو:{" "}
            <span dir="ltr">home → سکشن hero</span>، و{" "}
            <span dir="ltr">work, expertise, about, contact</span>. اگر سکشن در
            «چیدمان» خاموش شود، لینک منو هم مخفی می‌شود.
          </p>
          {site.nav.map((item: NavItem, i) => (
            <AdminCard
              key={`${item.id}-${i}`}
              className="grid gap-3 sm:grid-cols-2"
            >
              <AdminField label="برچسب">
                <input
                  className={adminInputClass}
                  value={item.label}
                  onChange={(e) => {
                    const nav = [...site.nav];
                    nav[i] = { ...item, label: e.target.value };
                    setSite({ ...site, nav });
                  }}
                />
              </AdminField>
              <AdminField label="شناسه سکشن" hint="مثل work یا expertise">
                <input
                  className={adminInputClass}
                  dir="ltr"
                  value={item.id}
                  onChange={(e) => {
                    const nav = [...site.nav];
                    nav[i] = { ...item, id: e.target.value.trim() };
                    setSite({ ...site, nav });
                  }}
                />
              </AdminField>
              <AdminField label="آدرس">
                <input
                  className={adminInputClass}
                  dir="ltr"
                  value={item.href}
                  onChange={(e) => {
                    const nav = [...site.nav];
                    nav[i] = { ...item, href: e.target.value };
                    setSite({ ...site, nav });
                  }}
                />
              </AdminField>
              <div className="flex flex-wrap items-end gap-1">
                <AdminButton
                  type="button"
                  variant="ghost"
                  onClick={() => moveNav(i, -1)}
                >
                  بالا
                </AdminButton>
                <AdminButton
                  type="button"
                  variant="ghost"
                  onClick={() => moveNav(i, 1)}
                >
                  پایین
                </AdminButton>
                <AdminButton
                  type="button"
                  variant="danger"
                  onClick={() =>
                    setSite({
                      ...site,
                      nav: site.nav.filter((_, idx) => idx !== i),
                    })
                  }
                >
                  حذف
                </AdminButton>
              </div>
            </AdminCard>
          ))}
          <div className="flex flex-wrap gap-2">
            <AdminButton
              type="button"
              variant="outline"
              onClick={() =>
                setSite({
                  ...site,
                  nav: [
                    ...site.nav,
                    {
                      id: "expertise",
                      label: "خدمات",
                      href: "/#expertise",
                    },
                  ],
                })
              }
            >
              + آیتم منو
            </AdminButton>
            <AdminButton
              type="button"
              disabled={saving}
              onClick={() => saveSite(site, "other")}
            >
              ذخیره منو
            </AdminButton>
          </div>
        </div>
      ) : null}

      {tab === "copy" ? (
        <div className="grid max-w-2xl gap-4">
          {(
            [
              ["hero", "هیرو"],
              ["bento", "خدمات"],
              ["work", "نمونه‌کارها"],
              ["about", "درباره"],
              ["contact", "تماس"],
            ] as const
          ).map(([key, title]) => (
            <AdminCard key={key} className="grid gap-3">
              <p className="text-sm text-accent">{title}</p>
              {key === "hero" ? (
                <>
                  <AdminField label="عنوان زیربرند">
                    <input
                      className={adminInputClass}
                      value={copy.hero.title}
                      onChange={(e) =>
                        setCopy({
                          ...copy,
                          hero: { ...copy.hero, title: e.target.value },
                        })
                      }
                    />
                  </AdminField>
                  <AdminField label="هایلایت">
                    <input
                      className={adminInputClass}
                      value={copy.hero.highlight}
                      onChange={(e) =>
                        setCopy({
                          ...copy,
                          hero: { ...copy.hero, highlight: e.target.value },
                        })
                      }
                    />
                  </AdminField>
                  <AdminField
                    label="خطوط تایپ‌رایتر"
                    hint="چند عبارت را با | جدا کن تا یکی‌یکی تایپ شوند"
                  >
                    <textarea
                      className={adminTextareaClass}
                      rows={3}
                      value={copy.hero.description}
                      onChange={(e) =>
                        setCopy({
                          ...copy,
                          hero: { ...copy.hero, description: e.target.value },
                        })
                      }
                    />
                  </AdminField>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <AdminField label="CTA اصلی" hint="دکمه هیرو و هدر">
                      <input
                        className={adminInputClass}
                        value={copy.hero.primaryCta}
                        onChange={(e) =>
                          setCopy({
                            ...copy,
                            hero: { ...copy.hero, primaryCta: e.target.value },
                          })
                        }
                      />
                    </AdminField>
                    <AdminField label="CTA ثانویه">
                      <input
                        className={adminInputClass}
                        value={copy.hero.secondaryCta}
                        onChange={(e) =>
                          setCopy({
                            ...copy,
                            hero: {
                              ...copy.hero,
                              secondaryCta: e.target.value,
                            },
                          })
                        }
                      />
                    </AdminField>
                  </div>
                </>
              ) : (
                <>
                  <AdminField label="برچسب بالا">
                    <input
                      className={adminInputClass}
                      value={copy[key].eyebrow}
                      onChange={(e) =>
                        setCopy({
                          ...copy,
                          [key]: { ...copy[key], eyebrow: e.target.value },
                        })
                      }
                    />
                  </AdminField>
                  <AdminField
                    label={
                      key === "about"
                        ? "عنوان سکشن (خالی = نام شخص)"
                        : "عنوان"
                    }
                  >
                    <input
                      className={adminInputClass}
                      value={copy[key].title}
                      onChange={(e) =>
                        setCopy({
                          ...copy,
                          [key]: { ...copy[key], title: e.target.value },
                        })
                      }
                    />
                  </AdminField>
                  <AdminField label="توضیح">
                    <textarea
                      className={adminTextareaClass}
                      rows={2}
                      value={copy[key].description}
                      onChange={(e) =>
                        setCopy({
                          ...copy,
                          [key]: {
                            ...copy[key],
                            description: e.target.value,
                          },
                        })
                      }
                    />
                  </AdminField>
                </>
              )}
            </AdminCard>
          ))}
          <AdminButton
            type="button"
            disabled={saving}
            onClick={() => save("copy", copy)}
          >
            ذخیره متن‌ها
          </AdminButton>
        </div>
      ) : null}

      {tab === "about" ? (
        <div className="grid max-w-2xl gap-4">
          <AdminCard className="grid gap-4">
            <AdminField label="نام">
              <input
                className={adminInputClass}
                value={member.name}
                onChange={(e) =>
                  setSite({
                    ...site,
                    team: [{ ...member, name: e.target.value }],
                  })
                }
              />
            </AdminField>
            <AdminField label="نقش">
              <input
                className={adminInputClass}
                value={member.role}
                onChange={(e) =>
                  setSite({
                    ...site,
                    team: [{ ...member, role: e.target.value }],
                  })
                }
              />
            </AdminField>
            <AdminField label="بیو">
              <textarea
                className={adminTextareaClass}
                rows={4}
                value={member.bio}
                onChange={(e) =>
                  setSite({
                    ...site,
                    team: [{ ...member, bio: e.target.value }],
                  })
                }
              />
            </AdminField>
            <AdminField label="موقعیت عکس" hint="مثال: 50% 16%">
              <input
                className={adminInputClass}
                dir="ltr"
                value={member.imagePosition ?? ""}
                onChange={(e) =>
                  setSite({
                    ...site,
                    team: [{ ...member, imagePosition: e.target.value }],
                  })
                }
              />
            </AdminField>
            <AdminField label="آدرس تصویر">
              <input
                className={adminInputClass}
                dir="ltr"
                value={member.image}
                onChange={(e) =>
                  setSite({
                    ...site,
                    team: [{ ...member, image: e.target.value }],
                  })
                }
              />
            </AdminField>
            <AdminField label="آپلود تصویر جدید">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="block w-full text-sm text-muted file:me-3 file:rounded-full file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-void"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const url = await upload(file);
                  if (!url) return;
                  setSite({
                    ...site,
                    team: [{ ...member, image: url }],
                  });
                  pushToast("تصویر آماده است؛ ذخیره را بزن.");
                  e.target.value = "";
                }}
              />
            </AdminField>
            <div className="grid gap-3 sm:grid-cols-2">
              <AdminField label="تلگرام">
                <input
                  className={adminInputClass}
                  dir="ltr"
                  value={member.links?.telegram ?? ""}
                  onChange={(e) =>
                    setSite({
                      ...site,
                      team: [
                        {
                          ...member,
                          links: { ...member.links, telegram: e.target.value },
                        },
                      ],
                    })
                  }
                />
              </AdminField>
              <AdminField label="گیت‌هاب">
                <input
                  className={adminInputClass}
                  dir="ltr"
                  value={member.links?.github ?? ""}
                  onChange={(e) =>
                    setSite({
                      ...site,
                      team: [
                        {
                          ...member,
                          links: { ...member.links, github: e.target.value },
                        },
                      ],
                    })
                  }
                />
              </AdminField>
            </div>
          </AdminCard>
          <AdminButton
            type="button"
            disabled={saving}
            onClick={() => saveSite(site, "about")}
          >
            ذخیره درباره من
          </AdminButton>
        </div>
      ) : null}

      {tab === "services" ? (
        <div className="space-y-3">
          {site.services.map((service, i) => (
            <AdminCard key={service.id} className="grid gap-3">
              <AdminField label="عنوان">
                <input
                  className={adminInputClass}
                  value={service.title}
                  onChange={(e) => {
                    const services = [...site.services];
                    services[i] = { ...service, title: e.target.value };
                    setSite({ ...site, services });
                  }}
                />
              </AdminField>
              <AdminField label="توضیح">
                <textarea
                  className={adminTextareaClass}
                  rows={2}
                  value={service.description}
                  onChange={(e) => {
                    const services = [...site.services];
                    services[i] = {
                      ...service,
                      description: e.target.value,
                    };
                    setSite({ ...site, services });
                  }}
                />
              </AdminField>
              <AdminField label="آیکون">
                <select
                  className={adminSelectClass}
                  value={service.icon}
                  onChange={(e) => {
                    const services = [...site.services];
                    services[i] = { ...service, icon: e.target.value };
                    setSite({ ...site, services });
                  }}
                >
                  {SERVICE_ICONS.map((icon) => (
                    <option key={icon.value} value={icon.value}>
                      {icon.label} ({icon.value})
                    </option>
                  ))}
                  {!SERVICE_ICONS.some((x) => x.value === service.icon) ? (
                    <option value={service.icon}>{service.icon}</option>
                  ) : null}
                </select>
              </AdminField>
              <AdminButton
                type="button"
                variant="danger"
                onClick={() =>
                  setSite({
                    ...site,
                    services: site.services.filter((_, idx) => idx !== i),
                  })
                }
              >
                حذف خدمت
              </AdminButton>
            </AdminCard>
          ))}
          <div className="flex flex-wrap gap-2">
            <AdminButton
              type="button"
              variant="outline"
              onClick={() => {
                const item: ServiceItem = {
                  id: `svc_${Date.now()}`,
                  title: "خدمت جدید",
                  description: "توضیح را اینجا بنویس.",
                  icon: "design",
                };
                setSite({ ...site, services: [...site.services, item] });
              }}
            >
              + افزودن خدمت
            </AdminButton>
            <AdminButton
              type="button"
              disabled={saving}
              onClick={() => saveSite(site, "other")}
            >
              ذخیره خدمات
            </AdminButton>
          </div>
        </div>
      ) : null}

      {tab === "projects" ? (
        <div className="space-y-3">
          {projects.map((project, i) => (
            <AdminCard key={project.id} className="grid gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <AdminField label="عنوان">
                  <input
                    className={adminInputClass}
                    value={project.title}
                    onChange={(e) => {
                      const next = [...projects];
                      next[i] = { ...project, title: e.target.value };
                      setProjects(next);
                    }}
                  />
                </AdminField>
                <AdminField label="تگ">
                  <input
                    className={adminInputClass}
                    value={project.tag}
                    onChange={(e) => {
                      const next = [...projects];
                      next[i] = { ...project, tag: e.target.value };
                      setProjects(next);
                    }}
                  />
                </AdminField>
              </div>
              <AdminField label="توضیح">
                <textarea
                  className={adminTextareaClass}
                  rows={2}
                  value={project.description}
                  onChange={(e) => {
                    const next = [...projects];
                    next[i] = { ...project, description: e.target.value };
                    setProjects(next);
                  }}
                />
              </AdminField>
              <div className="grid gap-3 sm:grid-cols-2">
                <AdminField label="دسته‌بندی">
                  <select
                    className={adminSelectClass}
                    value={project.category}
                    onChange={(e) => {
                      const next = [...projects];
                      next[i] = {
                        ...project,
                        category: e.target.value as ProjectItem["category"],
                      };
                      setProjects(next);
                    }}
                  >
                    {PROJECT_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </AdminField>
                <AdminField label="استایل کیس">
                  <select
                    className={adminSelectClass}
                    value={project.caseStyle ?? "default"}
                    onChange={(e) => {
                      const next = [...projects];
                      next[i] = {
                        ...project,
                        caseStyle: e.target
                          .value as ProjectItem["caseStyle"],
                      };
                      setProjects(next);
                    }}
                  >
                    {CASE_STYLES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </AdminField>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <AdminField label="لینک">
                  <input
                    className={adminInputClass}
                    dir="ltr"
                    value={project.href}
                    onChange={(e) => {
                      const next = [...projects];
                      next[i] = { ...project, href: e.target.value };
                      setProjects(next);
                    }}
                  />
                </AdminField>
                <AdminField label="پیش‌نمایش زنده">
                  <input
                    className={adminInputClass}
                    dir="ltr"
                    value={project.previewUrl ?? ""}
                    onChange={(e) => {
                      const next = [...projects];
                      next[i] = {
                        ...project,
                        previewUrl: e.target.value || undefined,
                      };
                      setProjects(next);
                    }}
                  />
                </AdminField>
              </div>
              <AdminField label="تصویر جایگزین">
                <input
                  className={adminInputClass}
                  dir="ltr"
                  value={project.image ?? ""}
                  onChange={(e) => {
                    const next = [...projects];
                    next[i] = {
                      ...project,
                      image: e.target.value || undefined,
                    };
                    setProjects(next);
                  }}
                />
              </AdminField>
              <div className="grid gap-3 sm:grid-cols-2">
                <AdminField label="گرادیان ۱">
                  <input
                    className={adminInputClass}
                    dir="ltr"
                    value={project.gradient?.[0] ?? "#0e0e14"}
                    onChange={(e) => {
                      const next = [...projects];
                      const g1 = project.gradient?.[1] ?? "#1e1e24";
                      next[i] = {
                        ...project,
                        gradient: [e.target.value, g1],
                      };
                      setProjects(next);
                    }}
                  />
                </AdminField>
                <AdminField label="گرادیان ۲">
                  <input
                    className={adminInputClass}
                    dir="ltr"
                    value={project.gradient?.[1] ?? "#1e1e24"}
                    onChange={(e) => {
                      const next = [...projects];
                      const g0 = project.gradient?.[0] ?? "#0e0e14";
                      next[i] = {
                        ...project,
                        gradient: [g0, e.target.value],
                      };
                      setProjects(next);
                    }}
                  />
                </AdminField>
              </div>
              <AdminField label="تک‌ها" hint="با ویرگول جدا کن">
                <input
                  className={adminInputClass}
                  dir="ltr"
                  value={(project.tech ?? []).join(", ")}
                  onChange={(e) => {
                    const next = [...projects];
                    next[i] = {
                      ...project,
                      tech: e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                    };
                    setProjects(next);
                  }}
                />
              </AdminField>
              <AdminField
                label="ارزش کسب‌وکار"
                hint="با ویرگول جدا کن؛ در کارت کیس نمایش داده می‌شود"
              >
                <input
                  className={adminInputClass}
                  value={(project.businessValue ?? []).join("، ")}
                  onChange={(e) => {
                    const next = [...projects];
                    next[i] = {
                      ...project,
                      businessValue: e.target.value
                        .split(/,|،/)
                        .map((t) => t.trim())
                        .filter(Boolean),
                    };
                    setProjects(next);
                  }}
                />
              </AdminField>
              <AdminField label="سال">
                <input
                  className={adminInputClass}
                  value={project.year ?? ""}
                  onChange={(e) => {
                    const next = [...projects];
                    next[i] = {
                      ...project,
                      year: e.target.value || undefined,
                    };
                    setProjects(next);
                  }}
                />
              </AdminField>
              <div className="flex flex-wrap gap-4">
                <AdminCheckbox
                  label="نمایش در صفحه اصلی"
                  checked={!!project.featured}
                  onChange={(checked) => {
                    const next = [...projects];
                    next[i] = { ...project, featured: checked };
                    setProjects(next);
                  }}
                />
                <AdminCheckbox
                  label="به‌زودی"
                  checked={!!project.comingSoon}
                  onChange={(checked) => {
                    const next = [...projects];
                    next[i] = { ...project, comingSoon: checked };
                    setProjects(next);
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <AdminButton
                  type="button"
                  variant="ghost"
                  onClick={() => moveProject(i, -1)}
                >
                  بالا
                </AdminButton>
                <AdminButton
                  type="button"
                  variant="ghost"
                  onClick={() => moveProject(i, 1)}
                >
                  پایین
                </AdminButton>
                <AdminButton
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const clone: ProjectItem = {
                      ...project,
                      id: `project_${Date.now()}`,
                      title: `${project.title} (کپی)`,
                    };
                    setProjects([...projects, clone]);
                  }}
                >
                  کپی
                </AdminButton>
                <AdminButton
                  type="button"
                  variant="danger"
                  onClick={() =>
                    setProjects(projects.filter((_, idx) => idx !== i))
                  }
                >
                  حذف
                </AdminButton>
              </div>
            </AdminCard>
          ))}
          <div className="flex flex-wrap gap-2">
            <AdminButton
              type="button"
              variant="outline"
              onClick={() => {
                const item: ProjectItem = {
                  id: `project_${Date.now()}`,
                  title: "پروژه جدید",
                  description: "توضیح پروژه را بنویس.",
                  tag: "Web",
                  href: "#",
                  gradient: ["#0e0e14", "#1e1e24"],
                  category: "web",
                  tech: [],
                  featured: true,
                  caseStyle: "default",
                };
                setProjects([...projects, item]);
              }}
            >
              + افزودن نمونه‌کار
            </AdminButton>
            <AdminButton
              type="button"
              disabled={saving}
              onClick={() => save("projects", projects)}
            >
              ذخیره نمونه‌کارها
            </AdminButton>
          </div>
        </div>
      ) : null}
    </div>
  );
}
