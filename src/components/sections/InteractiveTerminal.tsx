"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useCopy } from "@/hooks/useCopy";
import { usePrefs } from "@/context/PrefsContext";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { runTerminalCommand } from "@/lib/terminal-commands";
import { useSonic } from "@/hooks/useSonic";

interface Line {
  type: "input" | "output";
  text: string;
}

export function InteractiveTerminal() {
  const copy = useCopy();
  const { terminalHistory, pushTerminalHistory } = usePrefs();
  const { playType } = useSonic();
  const [lines, setLines] = useState<Line[]>([
    { type: "output", text: "raxinshop cli v1.0 — type `help`" },
  ]);
  const [value, setValue] = useState("");
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "nearest" });
  }, [lines]);

  const run = useCallback(
    (command: string) => {
      const trimmed = command.trim();
      if (!trimmed) return;
      pushTerminalHistory(trimmed);
      setHistoryIndex(null);

      if (trimmed.toLowerCase() === "clear") {
        setLines([]);
        setValue("");
        return;
      }

      const result = runTerminalCommand(trimmed);
      setLines((prev) => [
        ...prev,
        { type: "input", text: `$ ${trimmed}` },
        ...result.lines.map((text) => ({ type: "output" as const, text })),
      ]);
      setValue("");
    },
    [pushTerminalHistory],
  );

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    run(value);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!terminalHistory.length) return;
      const next =
        historyIndex === null
          ? terminalHistory.length - 1
          : Math.max(0, historyIndex - 1);
      setHistoryIndex(next);
      setValue(terminalHistory[next] ?? "");
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (historyIndex === null) return;
      const next = historyIndex + 1;
      if (next >= terminalHistory.length) {
        setHistoryIndex(null);
        setValue("");
      } else {
        setHistoryIndex(next);
        setValue(terminalHistory[next] ?? "");
      }
    }
  };

  return (
    <section id="terminal" className="border-b border-border py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <Reveal className="mb-12">
          <SectionHeading
            eyebrow={copy.terminal.eyebrow}
            title={copy.terminal.title}
            description={copy.terminal.description}
          />
        </Reveal>

        <Reveal>
          <div
            className="glass-panel overflow-hidden rounded-2xl"
            onClick={() => inputRef.current?.focus()}
            role="region"
            aria-label="ترمینال تعاملی"
          >
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-signal/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-gold/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-accent/80" />
              <span className="ms-3 font-mono text-[11px] text-dim">
                raxin@studio:~
              </span>
            </div>

            <div
              className="h-[320px] overflow-y-auto bg-void/60 p-4 font-mono text-[12px] leading-relaxed md:h-[380px]"
              dir="ltr"
            >
              {lines.map((line, i) => (
                <p
                  key={`${i}-${line.text.slice(0, 12)}`}
                  className={
                    line.type === "input" ? "text-accent" : "text-muted"
                  }
                >
                  {line.text}
                </p>
              ))}
              <div ref={bottomRef} />
            </div>

            <form
              onSubmit={onSubmit}
              className="flex items-center gap-2 border-t border-border bg-elevated/80 px-4 py-3"
              dir="ltr"
            >
              <span className="font-mono text-accent">$</span>
              <input
                ref={inputRef}
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  playType();
                }}
                onKeyDown={onKeyDown}
                className="w-full bg-transparent font-mono text-[13px] text-foreground outline-none placeholder:text-dim"
                placeholder="whoami"
                aria-label="دستور ترمینال"
                autoComplete="off"
                spellCheck={false}
              />
            </form>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
