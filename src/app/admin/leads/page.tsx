import { Suspense } from "react";
import AdminLeadsClient from "./page-client";

export default function AdminLeadsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted">در حال بارگذاری...</p>}>
      <AdminLeadsClient />
    </Suspense>
  );
}
