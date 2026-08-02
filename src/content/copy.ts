export type AudienceMode = "dev" | "executive";

export interface SectionCopy {
  eyebrow: string;
  title: string;
  description: string;
}

export interface LandingCopy {
  hero: {
    title: string;
    highlight: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
  };
  bento: SectionCopy;
  work: SectionCopy;
  warStories: SectionCopy;
  about: SectionCopy;
  contact: SectionCopy;
  apiPlayground: SectionCopy;
  architecture: SectionCopy;
  ceoDashboard: SectionCopy;
  workflow: SectionCopy;
  github: SectionCopy;
  terminal: SectionCopy;
  security: SectionCopy;
  splitCode: SectionCopy;
  systemStatus: SectionCopy;
  wasmDemo: SectionCopy;
  modeLabels: { dev: string; executive: string };
  welcomeBack: string;
  lowBattery: string;
  slowNetwork: string;
}

const unusedSection = (title: string): SectionCopy => ({
  eyebrow: "",
  title,
  description: "",
});

const sharedExtras = {
  apiPlayground: unusedSection("API playground"),
  architecture: unusedSection("Architecture"),
  ceoDashboard: unusedSection("CEO dashboard"),
  workflow: unusedSection("Workflow"),
  github: unusedSection("GitHub"),
  terminal: unusedSection("Terminal"),
  security: unusedSection("Security"),
  splitCode: unusedSection("Split code"),
  systemStatus: unusedSection("System status"),
  wasmDemo: unusedSection("WASM demo"),
};

export const copyByMode: Record<AudienceMode, LandingCopy> = {
  dev: {
    hero: {
      title: "از ایده تا محصول زنده",
      highlight: "با کیفیت production.",
      description:
        "طراحی، فرانت و زیرساخت؛ خروجی واقعی که بعد از لانچ هم قابل نگهداری بماند.",
      primaryCta: "شروع پروژه",
      secondaryCta: "نمونه‌کارها",
    },
    bento: {
      eyebrow: "",
      title: "چه می‌سازیم",
      description: "چهار حوزه اصلی؛ بدون وعده اضافه.",
    },
    work: {
      eyebrow: "",
      title: "نمونه‌کار واقعی",
      description: "از پلتفرم سلامت تا فروشگاه لوکس؛ خروجی قابل لمس، نه دموی تزئینی.",
    },
    warStories: {
      eyebrow: "",
      title: "چالش‌هایی که حل شدند",
      description: "مهاجرت بدون قطعی، تایید زیرساخت، و مدیریت دیتای واقعی.",
    },
    about: {
      eyebrow: "",
      title: "دو نفر، یک استاندارد",
      description: "کد قابل نگهداری و دیزاین دقیق؛ از ایده تا لانچ.",
    },
    contact: {
      eyebrow: "",
      title: "همکاری با ما",
      description: "کوتاه بنویس؛ معمولاً همان روز جواب می‌دهیم.",
    },
    ...sharedExtras,
    modeLabels: { dev: "فنی", executive: "مدیریتی" },
    welcomeBack: "خوش برگشتید.",
    lowBattery: "افکت‌های سنگین برای حفظ باتری خاموش شدند.",
    slowNetwork: "اتصال ضعیف؛ نسخهٔ سبک‌تر فعال شد.",
  },
  executive: {
    hero: {
      title: "پایداری و رشد",
      highlight: "بدون ریسک عملیاتی.",
      description:
        "زیرساخت مقیاس‌پذیر، گزارش شفاف پیشرفت، و محصولی که تیمتان می‌تواند نگه دارد.",
      primaryCta: "درخواست همکاری",
      secondaryCta: "نتایج پروژه‌ها",
    },
    bento: {
      eyebrow: "",
      title: "چه می‌سازیم",
      description: "چهار حوزه اصلی؛ بدون وعده اضافه.",
    },
    work: {
      eyebrow: "",
      title: "ارزش تجاری پروژه‌ها",
      description: "پایداری عملیاتی، تجربهٔ خرید لوکس، و هویت آمادهٔ بازار.",
    },
    warStories: {
      eyebrow: "",
      title: "بحران‌هایی که مدیریت شدند",
      description: "بدون قطعی، با مستندسازی شفاف، و آماده برای مقیاس.",
    },
    about: {
      eyebrow: "",
      title: "تیم اجرایی کوچک",
      description: "مسئولیت کامل از ایده تا لانچ، بدون لایه‌های اضافه.",
    },
    contact: {
      eyebrow: "",
      title: "همکاری با ما",
      description: "کوتاه بنویس؛ معمولاً همان روز جواب می‌دهیم.",
    },
    ...sharedExtras,
    modeLabels: { dev: "فنی", executive: "مدیریتی" },
    welcomeBack: "خوش برگشتید. گزارش‌ها آماده‌اند.",
    lowBattery: "افکت‌های سنگین برای حفظ باتری خاموش شدند.",
    slowNetwork: "اتصال ضعیف؛ نسخهٔ سبک‌تر فعال شد.",
  },
};
