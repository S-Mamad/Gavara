const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

export function installConsoleArt() {
  if (typeof window === "undefined") return;
  const flag = "__raxin_console_art__";
  if ((window as unknown as Record<string, boolean>)[flag]) return;
  (window as unknown as Record<string, boolean>)[flag] = true;

  const art = `
%c
██████╗  █████╗ ██╗  ██╗██╗███╗   ██╗
██╔══██╗██╔══██╗╚██╗██╔╝██║████╗  ██║
██████╔╝███████║ ╚███╔╝ ██║██╔██╗ ██║
██╔══██╗██╔══██║ ██╔██╗ ██║██║╚██╗██║
██║  ██║██║  ██║██╔╝ ██╗██║██║ ╚████║
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝
%cکدهای من رو چک می‌کنی؟ پس بیا با هم کار کنیم.
telegram: @Mamad3 · Mohammadi@gmail.com
`;
  console.log(
    art,
    "color:#3dffa8;font-family:monospace;font-size:11px;",
    "color:#9eb4d4;font-size:12px;",
  );
}

export function installKonami() {
  let index = 0;
  const onKey = (event: KeyboardEvent) => {
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    const expected = KONAMI[index];
    const match =
      expected === key ||
      (expected.length === 1 && expected === event.key.toLowerCase());
    if (match) {
      index += 1;
      if (index === KONAMI.length) {
        index = 0;
        document.documentElement.dataset.matrix =
          document.documentElement.dataset.matrix === "true" ? "false" : "true";
      }
    } else {
      index = expected === key ? 1 : 0;
    }
  };
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}
