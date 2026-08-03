const base = process.env.VERIFY_BASE || "http://localhost:3000";
const password = process.env.ADMIN_PASSWORD || "admin123";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function main() {
  const login = await fetch(`${base}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ password }),
  });
  const setCookies = login.headers.getSetCookie?.() || [];
  const cookie = setCookies.map((c) => c.split(";")[0]).join("; ");
  console.log("LOGIN", login.status);
  assert(login.status === 200, "login failed");

  async function api(path, init = {}) {
    const res = await fetch(`${base}${path}`, {
      ...init,
      headers: { cookie, ...(init.headers || {}) },
    });
    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      json = text;
    }
    return { status: res.status, json, text };
  }

  // --- content roundtrip ---
  const siteGet = await api("/api/admin/content?doc=site");
  const site = siteGet.json.data;
  const oldName = site.brand.name;
  const oldTag = site.brand.tagline;
  site.brand.name = "تست‌برند";
  site.brand.tagline = "تگ‌لاین تستی";
  const siteSave = await api("/api/admin/content", {
    method: "PUT",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ doc: "site", data: site }),
  });
  assert(siteSave.status === 200, "site save failed");

  const badSave = await api("/api/admin/content", {
    method: "PUT",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ doc: "site", data: { brand: {} } }),
  });
  assert(badSave.status === 400, "invalid site should 400");
  console.log("validation", "OK");

  const copyGet = await api("/api/admin/content?doc=copy");
  const copy = copyGet.json.data;
  const oldDesc = copy.hero.description;
  const oldCta = copy.hero.primaryCta;
  const oldEyebrow = copy.bento.eyebrow;
  copy.hero.description = "عبارت تست تایپ‌رایتر یک | عبارت تست دو";
  copy.hero.primaryCta = "CTA تستی";
  copy.bento.eyebrow = "eyebrow-test";
  await api("/api/admin/content", {
    method: "PUT",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ doc: "copy", data: copy }),
  });

  const layoutGet = await api("/api/admin/content?doc=layout");
  const layout = layoutGet.json.data;
  const origLayout = structuredClone(layout);
  layout.sections = layout.sections.map((s) =>
    s.id === "work" ? { ...s, enabled: false } : s,
  );
  await api("/api/admin/content", {
    method: "PUT",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ doc: "layout", data: layout }),
  });

  const home = await fetch(`${base}/`);
  const html = await home.text();
  assert(!html.includes("lead_"), "public page should not embed lead ids");

  const checks = {
    brand: html.includes("تست‌برند"),
    tagline: html.includes("تگ‌لاین تستی"),
    typewriter: html.includes("عبارت تست تایپ‌رایتر یک"),
    cta: html.includes("CTA تستی"),
    eyebrow: html.includes("eyebrow-test"),
    noWorkSection: !/id=["']work["']/.test(html),
  };
  for (const [k, v] of Object.entries(checks)) {
    console.log(k, v ? "OK" : "FAIL");
    assert(v, `check failed: ${k}`);
  }

  // --- backup export + restore ---
  const backup = await api("/api/admin/backup");
  assert(backup.status === 200 && backup.json.site, "backup export failed");
  const restore = await api("/api/admin/backup", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      action: "restore",
      includeLeads: false,
      data: backup.json,
    }),
  });
  assert(restore.status === 200, "backup restore failed");
  console.log("backup_restore", "OK");

  // --- leads patch enum ---
  const badLead = await api("/api/admin/leads", {
    method: "PATCH",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ ids: ["x"], status: "nope" }),
  });
  assert(badLead.status === 400, "bad lead status should 400");
  console.log("lead_status_validation", "OK");

  // --- stats without double-crash ---
  const stats = await api("/api/admin/stats");
  assert(stats.status === 200, "stats failed");
  console.log("stats", "OK");

  // restore original content values
  site.brand.name = oldName;
  site.brand.tagline = oldTag;
  await api("/api/admin/content", {
    method: "PUT",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ doc: "site", data: site }),
  });
  copy.hero.description = oldDesc;
  copy.hero.primaryCta = oldCta;
  copy.bento.eyebrow = oldEyebrow;
  await api("/api/admin/content", {
    method: "PUT",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ doc: "copy", data: copy }),
  });
  await api("/api/admin/content", {
    method: "PUT",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ doc: "layout", data: origLayout }),
  });
  console.log("restored");
  console.log("ALL_PASS");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
