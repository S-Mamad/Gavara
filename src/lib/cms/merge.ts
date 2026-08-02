import { copyByMode, type LandingCopy } from "@/content/copy";
import type { EditableCopy } from "./types";

export function mergeLandingCopy(editable: EditableCopy): LandingCopy {
  const base = copyByMode.dev;
  return {
    ...base,
    hero: editable.hero,
    bento: editable.bento,
    work: editable.work,
    about: editable.about,
    contact: editable.contact,
  };
}
