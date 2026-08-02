"use client";

import { useEffect, useRef, useState } from "react";
import { ChatCircle, PaperPlaneTilt, X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useSonic } from "@/hooks/useSonic";

const KB: { q: RegExp; a: string }[] = [
  {
    q: /معماری|architecture|مقیاس|infra/i,
    a: "بله. روی مرهم معماری production، مهاجرت IP بدون قطعی و یکپارچه‌سازی APIهای حساس را هندل کرده‌ایم.",
  },
  {
    q: /فروشگاه|عسل|ecommerce|حاجی/i,
    a: "حاجی‌عسل یک فروشگاه لوکس با دیتای واقعی، سبد، ادمین و پرفورمنس کاتالوگ است: /hajiasal",
  },
  {
    q: /قیمت|هزینه|cost|price/i,
    a: "بسته به دامنه پروژه متفاوت است. از فرم ارتباط یا تلگرام @Mamad3 جزئیات را بفرستید تا برآورد شفاف بدهیم.",
  },
  {
    q: /تیم|کی|who/i,
    a: "راکسین‌شاپ دو نفره است: محمد (فرانت و محصول) و امیر (برند و دیزاین).",
  },
];

const FALLBACK =
  "سوالتان را درباره مهارت‌ها، پروژه‌ها یا همکاری بپرسید. برای جزئیات بیشتر: hello@raxinshop.ir";

interface Msg {
  role: "user" | "bot";
  text: string;
}

export function FloatingAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "bot",
      text: "سلام. درباره رزومه و پروژه‌های راکسین‌شاپ بپرسید.",
    },
  ]);
  const endRef = useRef<HTMLDivElement>(null);
  const { playClick, playType } = useSonic();

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages, typing]);

  const send = () => {
    const text = input.trim();
    if (!text || typing) return;
    playClick();
    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setTyping(true);
    const match = KB.find((item) => item.q.test(text));
    const answer = match?.a ?? FALLBACK;
    window.setTimeout(() => {
      setMessages((prev) => [...prev, { role: "bot", text: answer }]);
      setTyping(false);
    }, 700);
  };

  return (
    <div className="fixed bottom-5 end-5 z-[var(--z-panel)] flex flex-col items-end gap-3">
      {open ? (
        <div
          className="glass-panel flex h-[420px] w-[min(100vw-2rem,360px)] flex-col overflow-hidden rounded-2xl shadow-2xl"
          role="dialog"
          aria-label="دستیار راکسین"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="font-mono text-[12px] text-accent">raxin assistant</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="بستن چت"
              className="text-dim hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
            {messages.map((msg, i) => (
              <div
                key={`${i}-${msg.text.slice(0, 8)}`}
                className={cn(
                  "max-w-[85%] rounded-xl px-3 py-2",
                  msg.role === "bot"
                    ? "bg-elevated text-muted"
                    : "ms-auto bg-accent/15 text-foreground",
                )}
              >
                {msg.text}
              </div>
            ))}
            {typing ? (
              <p className="font-mono text-[11px] text-dim">typing…</p>
            ) : null}
            <div ref={endRef} />
          </div>
          <form
            className="flex gap-2 border-t border-border p-3"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <input
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                playType();
              }}
              placeholder="سوال بپرسید…"
              className="flex-1 border border-border bg-void px-3 py-2 text-sm outline-none focus:border-accent"
              aria-label="پیام به دستیار"
            />
            <button
              type="submit"
              className="inline-flex h-10 w-10 items-center justify-center bg-accent text-void"
              aria-label="ارسال"
            >
              <PaperPlaneTilt className="h-4 w-4" weight="bold" />
            </button>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => {
          playClick();
          setOpen((v) => !v);
        }}
        className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-accent/40 bg-accent text-void shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        aria-label="باز کردن دستیار"
      >
        <ChatCircle className="h-5 w-5" weight="bold" />
      </button>
    </div>
  );
}
