/**
 * Full admin matrix test — run against local Next: node scripts/admin-matrix.mjs
 */
const base = process.env.VERIFY_BASE || "http://localhost:3000";
const password = process.env.ADMIN_PASSWORD || "admin123";

let failed = 0;
function ok(name, cond, detail = "") {
  if (cond) console.log(`PASS  ${name}`);
  else {
    failed += 1;
    console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function main() {
  // --- login ---
  const login = await fetch(`${base}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ password }),
  });
  const setCookies = login.headers.getSetCookie?.() || [];
  const cookie = setCookies.map((c) => c.split(";")[0]).join("; ");
  ok("login_200", login.status === 200, String(login.status));
  ok("login_cookie", cookie.includes("raxin_admin_session"));

  const badLogin = await fetch(`${base}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ password: "wrong-password-xx" }),
  });
  ok("login_wrong_401", badLogin.status === 401);

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

  async function page(path) {
    const res = await fetch(`${base}${path}`, { headers: { cookie } });
    return res.status;
  }

  // --- pages ---
  for (const p of [
    "/",
    "/work",
    "/admin",
    "/admin/login",
    "/admin/content",
    "/admin/sections",
    "/admin/leads",
    "/admin/media",
    "/admin/settings",
  ]) {
    const s = await page(p);
    ok(`page_${p}`, s === 200, String(s));
  }

  // public must not embed lead ids from cms
  const homeHtml = await (await fetch(`${base}/`)).text();
  ok("home_no_lead_prefix", !homeHtml.includes('"lead_'));

  // --- session / stats ---
  const session = await api("/api/admin/session");
  ok("session_auth", session.status === 200 && session.json.authenticated === true);
  ok("session_newLeads_number", typeof session.json.newLeads === "number");

  const sessionAnon = await fetch(`${base}/api/admin/session`);
  const sessionAnonJson = await sessionAnon.json();
  ok(
    "session_anon",
    sessionAnon.status === 200 && sessionAnonJson.authenticated === false,
  );

  const stats = await api("/api/admin/stats");
  ok("stats_200", stats.status === 200);
  ok("stats_shape", Array.isArray(stats.json.recentLeads));

  // --- content CRUD roundtrip ---
  const siteGet = await api("/api/admin/content?doc=site");
  ok("site_get", siteGet.status === 200 && siteGet.json.data?.brand);
  const site = structuredClone(siteGet.json.data);
  const clientsBefore = (site.clients || []).length;
  const oldTag = site.brand.tagline;
  site.brand.tagline = "تگ‌لاین ماتریکس تست";
  const sitePut = await api("/api/admin/content", {
    method: "PUT",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ doc: "site", data: site }),
  });
  ok("site_put", sitePut.status === 200);

  const siteAfter = await api("/api/admin/content?doc=site");
  ok(
    "site_clients_preserved",
    (siteAfter.json.data.clients || []).length === clientsBefore,
    `before=${clientsBefore} after=${(siteAfter.json.data.clients || []).length}`,
  );
  ok(
    "site_tagline_saved",
    siteAfter.json.data.brand.tagline === "تگ‌لاین ماتریکس تست",
  );

  const badSite = await api("/api/admin/content", {
    method: "PUT",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ doc: "site", data: { brand: {} } }),
  });
  ok("site_validation_400", badSite.status === 400);

  // copy
  const copyGet = await api("/api/admin/content?doc=copy");
  const copy = structuredClone(copyGet.json.data);
  const oldCopyTitle = copy.hero.title;
  copy.hero.title = "عنوان تست ماتریکس";
  const copyPut = await api("/api/admin/content", {
    method: "PUT",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ doc: "copy", data: copy }),
  });
  ok("copy_put", copyPut.status === 200);

  // projects
  const projGet = await api("/api/admin/content?doc=projects");
  ok("projects_get", Array.isArray(projGet.json.data));
  const projects = structuredClone(projGet.json.data);
  const projPut = await api("/api/admin/content", {
    method: "PUT",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ doc: "projects", data: projects }),
  });
  ok("projects_put", projPut.status === 200);

  // layout toggle
  const layoutGet = await api("/api/admin/content?doc=layout");
  const layout = structuredClone(layoutGet.json.data);
  const origLayout = structuredClone(layout);
  layout.sections = layout.sections.map((s) =>
    s.id === "work" ? { ...s, enabled: false } : s,
  );
  const layoutPut = await api("/api/admin/content", {
    method: "PUT",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ doc: "layout", data: layout }),
  });
  ok("layout_put", layoutPut.status === 200);

  const emptyLayout = await api("/api/admin/content", {
    method: "PUT",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      doc: "layout",
      data: {
        sections: layout.sections.map((s) => ({ ...s, enabled: false })),
      },
    }),
  });
  ok("layout_empty_rejected", emptyLayout.status === 400);

  // --- leads ---
  const leadPost = await fetch(`${base}/api/lead`, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      name: "تست ماتریکس",
      contact: "matrix@test.local",
      message: "این یک پیام تست ماتریکس ادمین است برای بررسی.",
      projectType: "website",
    }),
  });
  const leadJson = await leadPost.json();
  ok("lead_create", leadPost.status === 200 && leadJson.success === true);
  const leadId = leadJson.id;

  const leadsList = await api("/api/admin/leads?status=all");
  ok(
    "leads_list_has_new",
    (leadsList.json.leads || []).some((l) => l.id === leadId),
  );

  const patchBad = await api("/api/admin/leads", {
    method: "PATCH",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ ids: [leadId], status: "nope" }),
  });
  ok("leads_bad_status_400", patchBad.status === 400);

  const patchOk = await api("/api/admin/leads", {
    method: "PATCH",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ ids: [leadId], status: "read" }),
  });
  ok("leads_patch_read", patchOk.status === 200);

  const delLead = await api("/api/admin/leads", {
    method: "DELETE",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ ids: [leadId] }),
  });
  ok("leads_delete", delLead.status === 200 && delLead.json.removed >= 1);

  // lead rate / validation
  const shortLead = await fetch(`${base}/api/lead`, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ name: "ا", contact: "x", message: "کوتاه" }),
  });
  ok("lead_validation_400", shortLead.status === 400);

  // --- media ---
  const mediaList = await api("/api/admin/media");
  ok("media_list", mediaList.status === 200 && Array.isArray(mediaList.json.items));

  // 1x1 png
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
  );
  const form = new FormData();
  form.append("file", new Blob([png], { type: "image/png" }), "matrix.png");
  const upload = await fetch(`${base}/api/admin/upload`, {
    method: "POST",
    headers: { cookie },
    body: form,
  });
  const uploadJson = await upload.json();
  ok("upload_png", upload.status === 200 && !!uploadJson.url, uploadJson?.error);

  const uploadedName = uploadJson.url?.split("/").pop();
  const delMissing = await api("/api/admin/media", {
    method: "DELETE",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ name: "does-not-exist-xyz.png" }),
  });
  ok("media_delete_404", delMissing.status === 404);

  if (uploadedName) {
    const delOk = await api("/api/admin/media", {
      method: "DELETE",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ name: uploadedName }),
    });
    ok("media_delete_ok", delOk.status === 200);
  } else {
    ok("media_delete_ok", false, "no uploaded name");
  }

  // fake mime should fail magic sniff
  const badForm = new FormData();
  badForm.append(
    "file",
    new Blob([Buffer.from("not-an-image")], { type: "image/png" }),
    "fake.png",
  );
  const badUpload = await fetch(`${base}/api/admin/upload`, {
    method: "POST",
    headers: { cookie },
    body: badForm,
  });
  ok("upload_magic_reject", badUpload.status === 400);

  // --- backup ---
  const backup = await api("/api/admin/backup");
  ok("backup_export", backup.status === 200 && backup.json.site && backup.json.copy);

  const restore = await api("/api/admin/backup", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      action: "restore",
      includeLeads: false,
      data: backup.json,
    }),
  });
  ok("backup_restore", restore.status === 200);

  const badAction = await api("/api/admin/backup", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ action: "explode" }),
  });
  ok("backup_unknown_action", badAction.status === 400);

  // --- unauthorized without cookie ---
  const unauth = await fetch(`${base}/api/admin/content?doc=site`);
  ok("api_unauthorized", unauth.status === 401);

  // --- restore originals ---
  site.brand.tagline = oldTag;
  await api("/api/admin/content", {
    method: "PUT",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ doc: "site", data: site }),
  });
  copy.hero.title = oldCopyTitle;
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

  console.log("");
  if (failed) {
    console.log(`RESULT: ${failed} FAILED`);
    process.exit(1);
  }
  console.log("RESULT: ALL_PASS");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
