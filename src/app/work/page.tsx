import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollProgress } from "@/components/shell/ScrollProgress";
import { WorkArchive } from "@/components/sections/WorkArchive";
import { CmsProvider } from "@/context/CmsContext";
import { ensureCmsSeeded, getPublicCms } from "@/lib/cms/store";
import { mergeLandingCopy } from "@/lib/cms/merge";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "کارها و خدمات",
  description:
    "نمونه‌کارها و خدمات راکسین؛ طراحی سایت، تلگرام، پوستر، برند و محصول دیجیتال.",
  alternates: {
    canonical: "/work",
  },
};

export default async function WorkPage() {
  await ensureCmsSeeded();
  const cms = await getPublicCms();
  const copy = mergeLandingCopy(cms.copy);

  return (
    <CmsProvider
      value={{
        site: cms.site,
        projects: cms.projects,
        copy,
        layout: cms.layout,
      }}
    >
      <ScrollProgress />
      <Header />
      <main id="main" className="w-full max-w-full overflow-x-hidden">
        <WorkArchive />
      </main>
      <Footer />
    </CmsProvider>
  );
}
