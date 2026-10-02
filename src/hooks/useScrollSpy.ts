"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function useScrollSpy(sectionIds: string[], offset = 120) {
  const key = sectionIds.join("\n");
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const ids = key ? key.split("\n") : [];
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (!elements.length) {
      setActiveId("");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
          return;
        }

        const scrollY = window.scrollY + offset;
        for (let i = ids.length - 1; i >= 0; i -= 1) {
          const id = ids[i];
          const element = document.getElementById(id!);
          if (element && element.offsetTop <= scrollY) {
            setActiveId(id!);
            return;
          }
        }
      },
      {
        rootMargin: `-${offset}px 0px -55% 0px`,
        threshold: [0, 0.15, 0.35, 0.5],
      },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [key, offset]);

  return activeId;
}

/** Highlights the section in view. On the archive, خدمات lights up inside #services. */
export function useActiveSection(sectionIds: string[]) {
  const pathname = usePathname();
  const homeSpy = useScrollSpy(pathname === "/" ? sectionIds : []);
  const workSpy = useScrollSpy(pathname === "/work" ? ["services"] : []);
  if (pathname === "/work") {
    return workSpy === "services" ? "expertise" : "work";
  }
  return homeSpy;
}
