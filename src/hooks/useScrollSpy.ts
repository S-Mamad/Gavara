"use client";

import { useEffect, useState } from "react";

export function useScrollSpy(sectionIds: string[], offset = 120) {
  const [activeId, setActiveId] = useState(sectionIds[0] ?? "");

  useEffect(() => {
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (!elements.length) return;

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
        for (let i = sectionIds.length - 1; i >= 0; i -= 1) {
          const id = sectionIds[i];
          const element = document.getElementById(id);
          if (element && element.offsetTop <= scrollY) {
            setActiveId(id);
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
  }, [sectionIds, offset]);

  return activeId;
}
