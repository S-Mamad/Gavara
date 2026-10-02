import type { FaqItem, SiteConfig, TeamMember } from "@/types";
import { publicHref } from "@/lib/links";

function fallbackSiteUrl() {
  if (process.env.NODE_ENV === "production") return "https://raxinshop.com";
  return "http://localhost:3000";
}

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || fallbackSiteUrl()
).replace(/\/$/, "");

export function getSiteUrl() {
  return siteUrl;
}

export function buildOrganizationJsonLd(site: SiteConfig) {
  const email = site.links.find((l) => l.id === "email");

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: `${site.brand.name}${site.brand.suffix}`,
    alternateName: site.brand.slug,
    description: site.brand.description,
    url: siteUrl,
    email: email?.label,
    sameAs: site.links
      .filter((l) => l.id !== "email")
      .map((l) => publicHref(l.href))
      .filter((href): href is string => Boolean(href)),
  };
}

export function buildWebSiteJsonLd(site: SiteConfig) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: `${site.brand.name}${site.brand.suffix}`,
    url: siteUrl,
    description: site.brand.description,
    inLanguage: "fa-IR",
  };
}

export function buildPersonJsonLd(member: TeamMember) {
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: member.name,
    jobTitle: member.role,
    description: member.bio,
  };

  if (member.image) {
    jsonLd.image = member.image.startsWith("http")
      ? member.image
      : `${siteUrl}${member.image}`;
  }

  if (member.links?.telegram) {
    jsonLd.sameAs = [member.links.telegram];
  }
  const github = publicHref(member.links?.github);
  if (github) {
    jsonLd.sameAs = [...((jsonLd.sameAs as string[]) ?? []), github];
  }
  if (member.links?.linkedin) {
    jsonLd.sameAs = [
      ...((jsonLd.sameAs as string[]) ?? []),
      member.links.linkedin,
    ];
  }

  return jsonLd;
}

export function buildFaqJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
