import type { Metadata } from "next";
import { JetBrains_Mono, Vazirmatn } from "next/font/google";
import site from "@/data/site.json";
import type { SiteConfig } from "@/types";
import { getSiteUrl } from "@/lib/seo";
import { AppProviders } from "@/components/shell/AppProviders";
import "./globals.css";

const data = site as SiteConfig;
const siteUrl = getSiteUrl();
const siteName = `${data.brand.name}${data.brand.suffix}`;

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "800"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} | استودیو توسعه`,
    template: `%s | ${siteName}`,
  },
  description: data.brand.description,
  keywords: [
    "استودیو توسعه",
    "فرانت‌اند",
    "Next.js",
    "React",
    "طراحی محصول",
    "راکسین‌شاپ",
    "تهران",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${siteName} | استودیو توسعه`,
    description: data.brand.description,
    url: "/",
    siteName,
    locale: "fa_IR",
    type: "website",
    images: [
      {
        url: "/og/raxinshop.webp",
        width: 1200,
        height: 630,
        alt: `${siteName} | استودیو توسعه`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} | استودیو توسعه`,
    description: data.brand.description,
    images: ["/og/raxinshop.webp"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${vazirmatn.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="relative min-h-full bg-transparent text-foreground">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:rounded focus:border focus:border-accent focus:bg-void focus:px-4 focus:py-2 focus:text-sm focus:text-foreground"
        >
          پرش به محتوا
        </a>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
