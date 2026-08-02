"use client";

import { useCms } from "@/context/CmsContext";

export function useCopy() {
  return useCms().copy;
}
