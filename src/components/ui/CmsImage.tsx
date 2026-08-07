"use client";

import Image, { type ImageProps } from "next/image";

/**
 * Local CMS uploads (`/uploads/...`) skip Next image optimization so
 * cPanel/standalone hosts that cannot run the optimizer still show files.
 */
export function CmsImage({ src, alt, ...rest }: ImageProps) {
  const path = typeof src === "string" ? src : "";
  const unoptimized =
    rest.unoptimized ??
    (path.startsWith("/uploads/") || path.startsWith("data:"));

  return <Image src={src} alt={alt} unoptimized={unoptimized} {...rest} />;
}
