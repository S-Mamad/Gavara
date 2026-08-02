"use client";

import { copyByMode } from "@/content/copy";

export function useCopy() {
  return copyByMode.dev;
}
