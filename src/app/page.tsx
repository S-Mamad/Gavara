import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollProgress } from "@/components/shell/ScrollProgress";
import { HomeSections } from "@/components/shell/HomeSections";
import { CmsProvider } from "@/context/CmsContext";
import { ensureCmsSeeded, getPublicCms } from "@/lib/cms/store";
import { mergeLandingCopy } from "@/lib/cms/merge";
import {
  buildOrganizationJsonLd,
  buildPersonJsonLd,
  buildWebSiteJsonLd,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ service?: string | string[] }>;
}) {
  const params = await searchParams;
  const raw = params.service;
  const initialService =
    (Array.isArray(raw) ? raw[0] : raw)?.trim() || null;
  await ensureCmsSeeded();
  const cms = await getPublicCms();
  const copy = mergeLandingCopy(cms.copy);
  const data = cms.site;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      buildOrganizationJsonLd(data),
      buildWebSiteJsonLd(data),
      ...data.team.map((member) => buildPersonJsonLd(member)),
    ],
  };

  return (
    <CmsProvider
      value={{
        site: cms.site,
        projects: cms.projects,
        copy,
        layout: cms.layout,
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd)
            .replace(/</g, "\\u003c")
            .replace(/>/g, "\\u003e")
            .replace(/&/g, "\\u0026"),
        }}
      />
      <ScrollProgress />
      <Header />
      <main id="main" className="w-full max-w-full overflow-x-hidden bg-void">
        <HomeSections initialService={initialService} />
      </main>
      <Footer />
    </CmsProvider>
  );
}
