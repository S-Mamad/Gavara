import { Suspense } from "react";
import AdminLoginPage from "./page-client";

export default function Page() {
  return (
    <Suspense
      fallback={<div className="p-8 text-center text-muted">در حال بارگذاری...</div>}
    >
      <AdminLoginPage />
    </Suspense>
  );
}
