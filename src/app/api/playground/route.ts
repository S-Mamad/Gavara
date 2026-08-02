import { NextRequest, NextResponse } from "next/server";

const PAYLOADS: Record<string, unknown> = {
  skills: {
    ok: true,
    data: {
      languages: ["TypeScript", "JavaScript"],
      frameworks: ["React", "Next.js"],
      infra: ["Vercel", "PostgreSQL", "CI"],
      focus: ["architecture", "zero-downtime", "a11y"],
    },
  },
  projects: {
    ok: true,
    data: [
      { id: "marham", value: "health SaaS · infra" },
      { id: "hajiasal", value: "luxury commerce" },
      { id: "hamgam", value: "brand system" },
    ],
  },
  resume: {
    ok: true,
    data: {
      studio: "Raxinshop",
      city: "Tehran",
      contact: "hello@raxinshop.ir",
      highlights: [
        "Production frontends at scale",
        "Infra migrations without downtime",
        "Business-aware delivery",
      ],
    },
  },
};

export async function GET(request: NextRequest) {
  const resource = request.nextUrl.searchParams.get("resource") ?? "skills";
  const payload = PAYLOADS[resource] ?? {
    ok: false,
    error: "unknown_resource",
  };

  await new Promise((r) => setTimeout(r, 280));

  return NextResponse.json(payload);
}
