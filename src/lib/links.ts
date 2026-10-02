/** True when the URL is the GitHub homepage, not a user or org profile. */
export function isBareGithub(href: string | null | undefined): boolean {
  if (!href) return false;
  try {
    const url = new URL(href);
    const host = url.hostname.replace(/^www\./, "");
    if (host !== "github.com") return false;
    const path = url.pathname.replace(/\/+$/, "");
    return path === "";
  } catch {
    return false;
  }
}

/** Drop empty and placeholder GitHub homepage links. */
export function publicHref(href: string | null | undefined): string | null {
  if (!href?.trim() || isBareGithub(href)) return null;
  return href;
}
