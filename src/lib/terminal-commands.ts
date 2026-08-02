export interface TerminalResult {
  lines: string[];
}

const SKILLS = [
  "TypeScript / React / Next.js",
  "System architecture & API design",
  "Infra migrations · zero-downtime",
  "GitHub repo hygiene & CI",
  "Performance · a11y · SEO",
];

const PROJECTS = [
  "marham/     health SaaS @ Paziresh24",
  "hajiasal/   luxury honey commerce",
  "hamgam/     brand system (soon)",
];

export function runTerminalCommand(input: string): TerminalResult {
  const raw = input.trim();
  const cmd = raw.toLowerCase();

  if (!cmd) return { lines: [] };

  if (cmd === "help" || cmd === "?") {
    return {
      lines: [
        "Available commands:",
        "  help                 show this list",
        "  whoami               bio",
        "  ls projects          list case studies",
        "  cat skills.json      stack & capabilities",
        "  contact              how to reach us",
        "  clear                clear screen",
      ],
    };
  }

  if (cmd === "whoami") {
    return {
      lines: [
        "raxinshop — Tehran product studio",
        "Mohammad Mohammadi · frontend & product",
        "Amir Haji Abedi · brand & digital design",
        "Shipping production systems, not demos.",
      ],
    };
  }

  if (cmd === "ls" || cmd === "ls projects" || cmd === "ls ./projects") {
    return { lines: PROJECTS };
  }

  if (
    cmd === "cat skills.json" ||
    cmd === "skills" ||
    cmd === "cat skills"
  ) {
    return {
      lines: ["{", ...SKILLS.map((s) => `  "${s}",`), "}"],
    };
  }

  if (cmd === "contact") {
    return {
      lines: [
        "telegram  @Mamad3",
        "channel   @RaxinShop",
        "email     hello@raxinshop.ir",
      ],
    };
  }

  if (cmd === "clear") {
    return { lines: ["__CLEAR__"] };
  }

  return {
    lines: [
      `command not found: ${raw}`,
      "type `help` for available commands.",
    ],
  };
}
