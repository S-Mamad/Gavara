const base = "http://localhost:3000";

async function main() {
  const login = await fetch(`${base}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ password: "admin123" }),
  });
  const cookie = (login.headers.getSetCookie?.() || []).join("; ");
  console.log("LOGIN", login.status);

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

  const siteGet = await api("/api/admin/content?doc=site");
  const site = siteGet.json.data;
  const oldName = site.brand.name;
  const oldTag = site.brand.tagline;
  site.brand.name = "تست‌برند";
  site.brand.tagline = "تگ‌لاین تستی";
  await api("/api/admin/content", {
    method: "PUT",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ doc: "site", data: site }),
  });

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

  const checks = {
    brand: html.includes("تست‌برند"),
    tagline: html.includes("تگ‌لاین تستی"),
    typewriter: html.includes("عبارت تست تایپ‌رایتر یک"),
    cta: html.includes("CTA تستی"),
    eyebrow: html.includes("eyebrow-test"),
    noWorkSection: !/id=["']work["']/.test(html),
    expertiseNav: html.includes("/#expertise"),
  };

  for (const [k, v] of Object.entries(checks)) {
    console.log(k, v ? "OK" : "FAIL");
  }

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
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
