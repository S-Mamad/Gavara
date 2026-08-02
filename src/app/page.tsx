import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollProgress } from "@/components/shell/ScrollProgress";
import { HomeSections } from "@/components/shell/HomeSections";
import site from "@/data/site.json";
import type { SiteConfig } from "@/types";
import {
  buildOrganizationJsonLd,
  buildPersonJsonLd,
  buildWebSiteJsonLd,
} from "@/lib/seo";

const data = site as SiteConfig;

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      buildOrganizationJsonLd(data),
      buildWebSiteJsonLd(data),
      ...data.team.map((member) => buildPersonJsonLd(member)),
    ],
  };

  return (
    <>
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
      <main id="main" className="w-full max-w-full overflow-x-hidden">
        <HomeSections />
      </main>
      <Footer />
    </>
  );
}
