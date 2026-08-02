"use client";

import { Hero } from "@/components/sections/Hero";
import { Work } from "@/components/sections/Work";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";

export function HomeSections() {
  return (
    <>
      <Hero />
      <Work />
      <About />
      <Contact />
    </>
  );
}
