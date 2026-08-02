# DESIGN-DECISIONS.md — redesign v4.0

## Design Read
استودیوی dev پریمیوم برای بنیان‌گذاران استارتاپ ایرانی؛ زبان editorial + asymmetric + image-led proof. نه ترمینال شلوغ v2، نه minimal خالی v3.1.

**Dials:** VARIANCE 7 · MOTION 5 · DENSITY 4

## چه عوض شد

| قبل (v3.1) | بعد (v4.0) |
|---|---|
| Hero centered خالی | Hero نامتقارن: متن + showcase تصویر |
| فقط gradient ملایم | Grid subtle + glow نقطه‌ای accent |
| کارت‌های portfolio با SVG | تصاویر mockup واقعی + BrowserFrame |
| کارت‌های تیم افقی بلند | کارت عمودی با overlay نام |
| Social proof متن ساده | pill badges برای مشتریان |
| Why/Expertise flat | آیکون Phosphor + hover accent |

## حفظ شده
- RTL، Vazirmatn + JetBrains Mono، Phosphor
- فرم تماس + API + honeypot
- FAQ، Process، JSON-LD
- `/hajiasal` بدون تغییر
- Nav ۵ آیتم header + footer links

## تصاویر
- `public/portfolio/hero-showcase.png` — Hero + پروژه حاجی عسل
- `public/portfolio/marham-showcase.png` — مرهم
- `public/portfolio/brand-showcase.png` — همگام

## عمداً حذف نشده
- scanlines / mesh / IDE window / marquee (هنوز حذف)
- motion محدود: Reveal + HeroShowcase fade
