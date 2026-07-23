import { Suspense } from "react";
import { ReportCreatePage } from "@/views/student/report-create";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ReportCreatePage />
    </Suspense>
  );
}
