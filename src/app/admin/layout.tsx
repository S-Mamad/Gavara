import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata = {
  title: "ادمین | راکسین",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
