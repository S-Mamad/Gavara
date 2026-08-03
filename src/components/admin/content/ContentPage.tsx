"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { EditableCopy, LayoutConfig } from "@/lib/cms/types";
import type { ProjectItem, SiteConfig } from "@/types";
import { useToast } from "@/components/ui/Toast";
import {
  AdminButton,
  AdminErrorState,
  AdminPageHeader,
  AdminStickySave,
  AdminTabs,
  AdminToolbar,
} from "@/components/admin/ui";
import { adminFetch, adminFetchJson, errorMessage } from "@/lib/admin/fetchJson";
import { useBeforeUnloadGuard, useConfirmLeave } from "@/hooks/useDirtyGuard";
import { cn } from "@/lib/utils";
import { AboutTab } from "./AboutTab";
import { BrandTab } from "./BrandTab";
import { CopyTab } from "./CopyTab";
import { LandingTab } from "./LandingTab";
import { NavTab } from "./NavTab";
import { ProjectsTab } from "./ProjectsTab";
import { ServicesTab } from "./ServicesTab";
import { type ContentPayload, type Tab, TABS } from "./types";

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

function prepareSiteForSave(site: SiteConfig, baselineJson: string): SiteConfig {
  const baseline = JSON.parse(baselineJson) as SiteConfig;
  const linksChanged =
    JSON.stringify(site.links) !== JSON.stringify(baseline.links);
  const teamLinksChanged =
    JSON.stringify(site.team[0]?.links) !==
    JSON.stringify(baseline.team[0]?.links);

  if (linksChanged && !teamLinksChanged) {
    return syncSiteLinksToTeam(site);
  }
  if (teamLinksChanged && !linksChanged) {
    return syncTeamToSiteLinks(site);
  }
  if (linksChanged && teamLinksChanged) {
    return syncSiteLinksToTeam(site);
  }
  return site;
}

export function ContentPage() {
  const { pushToast } = useToast();
  const [tab, setTab] = useState<Tab>("brand");
  const [site, setSite] = useState<SiteConfig | null>(null);
  const [copy, setCopy] = useState<EditableCopy | null>(null);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [layout, setLayout] = useState<LayoutConfig | null>(null);
  const [baselineSite, setBaselineSite] = useState("");
  const [baselineCopy, setBaselineCopy] = useState("");
  const [baselineProjects, setBaselineProjects] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [siteRes, copyRes, projectsRes, layoutRes] = await Promise.all([
        adminFetchJson<ContentPayload<SiteConfig>>("/api/admin/content?doc=site"),
        adminFetchJson<ContentPayload<EditableCopy>>(
          "/api/admin/content?doc=copy",
        ),
        adminFetchJson<ContentPayload<ProjectItem[]>>(
          "/api/admin/content?doc=projects",
        ),
        adminFetchJson<ContentPayload<LayoutConfig>>(
          "/api/admin/content?doc=layout",
        ),
      ]);
      if (!siteRes.data || !copyRes.data) {
        throw new Error("داده محتوا ناقص است.");
      }
      const siteData = siteRes.data;
      const copyData = copyRes.data;
      const projectsData = projectsRes.data ?? [];
      setSite(siteData);
      setCopy(copyData);
      setProjects(projectsData);
      setLayout(layoutRes.data ?? null);
      setBaselineSite(JSON.stringify(siteData));
      setBaselineCopy(JSON.stringify(copyData));
      setBaselineProjects(JSON.stringify(projectsData));
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

  const siteDirty = useMemo(
    () => !!site && JSON.stringify(site) !== baselineSite,
    [site, baselineSite],
  );
  const copyDirty = useMemo(
    () => !!copy && JSON.stringify(copy) !== baselineCopy,
    [copy, baselineCopy],
  );
  const projectsDirty = useMemo(
    () => JSON.stringify(projects) !== baselineProjects,
    [projects, baselineProjects],
  );
  const dirty = siteDirty || copyDirty || projectsDirty;

  useBeforeUnloadGuard(dirty);
  const confirmLeave = useConfirmLeave(dirty);

  function switchTab(next: Tab) {
    if (next === tab) return;
    if (!confirmLeave()) return;
    setTab(next);
  }

  function openPreview() {
    window.open(`/?t=${Date.now()}`, "_blank", "noopener,noreferrer");
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

  async function saveAll() {
    if (!site || !copy || !dirty) return;

    setSaving(true);
    const saves: Promise<void>[] = [];
    let savedCount = 0;

    try {
      if (siteDirty) {
        const payload = prepareSiteForSave(site, baselineSite);
        saves.push(
          adminFetch("/api/admin/content", {
            method: "PUT",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify({ doc: "site", data: payload }),
          }).then(() => {
            setSite(payload);
            setBaselineSite(JSON.stringify(payload));
            savedCount++;
          }),
        );
      }

      if (copyDirty) {
        saves.push(
          adminFetch("/api/admin/content", {
            method: "PUT",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify({ doc: "copy", data: copy }),
          }).then(() => {
            setBaselineCopy(JSON.stringify(copy));
            savedCount++;
          }),
        );
      }

      if (projectsDirty) {
        saves.push(
          adminFetch("/api/admin/content", {
            method: "PUT",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify({ doc: "projects", data: projects }),
          }).then(() => {
            setBaselineProjects(JSON.stringify(projects));
            savedCount++;
          }),
        );
      }

      await Promise.all(saves);
      pushToast(
        savedCount > 1 ? `${savedCount} بخش ذخیره شد.` : "ذخیره شد.",
        "success",
      );
    } catch (err) {
      pushToast(errorMessage(err, "خطا در ذخیره."), "error");
    } finally {
      setSaving(false);
    }
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

  return (
    <div className={cn(dirty && "pb-16 md:pb-12")}>
      <AdminPageHeader
        title="محتوا"
        description="متن‌ها، منو، درباره، خدمات و نمونه‌کارها را بدون کدنویسی مدیریت کن."
        actions={
          <>
            {dirty ? (
              <span className="self-center text-xs text-signal">
                ● تغییرات ذخیره‌نشده
              </span>
            ) : null}
            <AdminButton type="button" variant="outline" onClick={openPreview}>
              پیش‌نمایش
            </AdminButton>
          </>
        }
      />

      <AdminToolbar>
        <AdminTabs items={TABS} value={tab} onChange={switchTab} />
        <div className="ms-auto hidden md:block">
          <AdminButton
            type="button"
            disabled={!dirty || saving}
            onClick={saveAll}
          >
            {saving ? "در حال ذخیره..." : "ذخیره"}
          </AdminButton>
        </div>
      </AdminToolbar>

      {tab === "brand" ? <BrandTab site={site} onChange={setSite} /> : null}
      {tab === "landing" ? (
        <LandingTab site={site} onChange={setSite} />
      ) : null}
      {tab === "nav" ? (
        <NavTab
          site={site}
          layout={layout}
          onChange={setSite}
          onMove={moveNav}
        />
      ) : null}
      {tab === "copy" ? <CopyTab copy={copy} onChange={setCopy} /> : null}
      {tab === "about" ? (
        <AboutTab site={site} onChange={setSite} onUpload={upload} />
      ) : null}
      {tab === "services" ? (
        <ServicesTab site={site} onChange={setSite} />
      ) : null}
      {tab === "projects" ? (
        <ProjectsTab
          projects={projects}
          onChange={setProjects}
          onUpload={upload}
        />
      ) : null}

      <AdminStickySave dirty={dirty} saving={saving} onSave={saveAll} />
    </div>
  );
}
