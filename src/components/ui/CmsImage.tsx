"use client";

import Image, { type ImageProps } from "next/image";

function isLocalSrc(src: ImageProps["src"]): boolean {
  if (typeof src !== "string") return true;
  return (
    src.startsWith("/") ||
    src.startsWith("data:") ||
    src.startsWith("blob:")
  );
}

/**
 * Local CMS and static files skip Next image optimization so
 * cPanel/standalone hosts that cannot run the optimizer still show files.
 */
export function CmsImage({ src, alt, ...rest }: ImageProps) {
  const unoptimized = rest.unoptimized ?? isLocalSrc(src);

  return <Image src={src} alt={alt} unoptimized={unoptimized} {...rest} />;
}
