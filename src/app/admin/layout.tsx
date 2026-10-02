import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata = {
  title: "ادمین",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
