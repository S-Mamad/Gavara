import Link from "next/link";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-5 text-center">
      <p className="label-mono mb-6 text-muted">۴۰۴ · صفحه یافت نشد</p>
      <BrandLogo className="mb-4 text-2xl" />
      <h1 className="font-display text-3xl text-foreground md:text-4xl">
        این صفحه وجود ندارد
      </h1>
      <p className="mt-4 max-w-md text-sm text-muted">
        آدرس اشتباه است یا صفحه حذف شده. به خانه برگرد یا با ما تماس بگیر.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Button href="/" size="lg">
          بازگشت به خانه
        </Button>
        <Button href="/#contact" variant="outline" size="lg">
          ارتباط با ما
        </Button>
      </div>
      <Link
        href="/hajiasal"
        className="mt-8 font-mono text-xs text-dim transition-colors hover:text-accent"
      >
        hajiasal →
      </Link>
    </div>
  );
}
