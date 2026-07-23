import { ReportDetailPage } from "@/views/student/report-detail";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ReportDetailPage reportId={id} />;
}
