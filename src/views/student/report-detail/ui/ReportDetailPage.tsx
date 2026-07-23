export function ReportDetailPage({ reportId }: { reportId: string }) {
  return (
    <main className="flex flex-1 flex-col gap-4 px-6 py-10">
      <h1 className="text-2xl font-semibold">신고 상세</h1>
      <p className="text-zinc-500">신고 #{reportId} 상세 및 상태 polling이 표시될 자리입니다.</p>
    </main>
  );
}
