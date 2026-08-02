import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollProgress } from "@/components/shell/ScrollProgress";
import { WorkArchive } from "@/components/sections/WorkArchive";

export const metadata: Metadata = {
  title: "کارها و خدمات",
  description:
    "نمونه‌کارها و خدمات راکسین‌شاپ؛ طراحی سایت، تلگرام، پوستر، برند و محصول دیجیتال.",
  alternates: {
    canonical: "/work",
  },
};

export default function WorkPage() {
  return (
    <>
      <ScrollProgress />
      <Header />
      <main id="main" className="w-full max-w-full overflow-x-hidden">
        <WorkArchive />
      </main>
      <Footer />
    </>
  );
}
