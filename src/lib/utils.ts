import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Hostname for browser-chrome previews. Empty for in-page hashes. */
export function previewHost(url?: string | null): string {
  const raw = (url ?? "").trim();
  if (!raw || raw.startsWith("#") || raw.startsWith("/")) return "";
  try {
    const host = new URL(raw).hostname.replace(/^www\./, "");
    return host;
  } catch {
    return raw.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  }
}
