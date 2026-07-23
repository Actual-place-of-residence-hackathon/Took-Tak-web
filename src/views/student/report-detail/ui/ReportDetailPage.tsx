"use client";

import { useReport } from "@/entities/report";
import { reportLocationLabel } from "@/shared/lib/report-location";
import { BackButton, Card, EmptyState, StatusBadge, UrgencyBadge } from "@/shared/ui";
import { REPORT_STATUS_LABELS, type ReportStatus } from "@/shared/types/report";

const STEPS: ReportStatus[] = ["received", "checking", "processing", "done"];

export function ReportDetailPage({ reportId }: { reportId: string }) {
  const { data: report, isLoading } = useReport(reportId);

  if (isLoading) return <EmptyState message="불러오는 중입니다..." />;
  if (!report) return <EmptyState message="신고 내역을 찾을 수 없습니다." />;

  const stepIndex = STEPS.indexOf(report.status);
  const actionPhotos = report.photos.filter((p) => p.kind === "action");

  return (
    <main className="animate-tt-fade-in mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8">
      <BackButton />
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <StatusBadge status={report.status} />
          {report.urgency && <UrgencyBadge urgency={report.urgency} />}
        </div>
        <h1 className="text-xl font-semibold text-zinc-800">{reportLocationLabel(report)}</h1>
        <p className="text-sm text-zinc-500">{report.category ?? "분류 대기 중"}</p>
      </div>

      <Card>
        <h2 className="mb-3 font-semibold text-zinc-800">처리 타임라인</h2>
        {report.status === "hold" ? (
          <p className="text-sm text-rose-500">
            보류됨 —{" "}
            {report.statusHistory.at(-1)?.reason ?? "사유가 등록되지 않았습니다."}
          </p>
        ) : (
          <ol className="flex items-start">
            {STEPS.map((step, i) => {
              const entry = report.statusHistory.find((h) => h.toStatus === step);
              const reached = i <= stepIndex;
              const lineToNextReached = i < stepIndex;

              return (
                <li key={step} className="flex flex-1 flex-col items-center">
                  <div className="flex w-full items-center">
                    <div
                      className={`h-0.5 flex-1 ${i === 0 ? "invisible" : reached ? "bg-primary-500" : "bg-zinc-200"}`}
                    />
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                        reached ? "bg-primary-500 text-white" : "bg-zinc-200 text-zinc-500"
                      }`}
                    >
                      {reached ? "✓" : i + 1}
                    </div>
                    <div
                      className={`h-0.5 flex-1 ${
                        i === STEPS.length - 1
                          ? "invisible"
                          : lineToNextReached
                            ? "bg-primary-500"
                            : "bg-zinc-200"
                      }`}
                    />
                  </div>
                  <span
                    className={`mt-2 text-sm font-medium ${reached ? "text-zinc-800" : "text-zinc-400"}`}
                  >
                    {REPORT_STATUS_LABELS[step]}
                  </span>
                  {entry && (
                    <span className="mt-0.5 flex flex-col items-center text-xs text-zinc-400">
                      <span>{new Date(entry.changedAt).toLocaleDateString("ko-KR")}</span>
                      <span>{new Date(entry.changedAt).toLocaleTimeString("ko-KR")}</span>
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </Card>

      <Card>
        <h2 className="mb-2 font-semibold text-zinc-800">AI 분석 근거</h2>
        <p className="text-sm text-zinc-600">
          {report.aiReason || "분류 근거가 등록되지 않았습니다."}
        </p>
        {report.aiSummary && <p className="mt-1 text-xs text-zinc-400">요약: {report.aiSummary}</p>}
      </Card>

      <Card>
        <h2 className="mb-2 font-semibold text-zinc-800">신고 내용</h2>
        <p className="text-sm whitespace-pre-line text-zinc-600">{report.description}</p>
        {report.photos.filter((p) => p.kind === "report").length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {report.photos
              .filter((p) => p.kind === "report")
              .map((photo) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={photo.id}
                  src={photo.url}
                  alt="신고 사진"
                  className="aspect-square rounded-lg object-cover"
                />
              ))}
          </div>
        )}
      </Card>

      {report.status === "done" && report.actions.length > 0 && (
        <Card>
          <h2 className="mb-2 font-semibold text-zinc-800">조치 결과</h2>
          {report.actions.map((action) => (
            <p key={action.id} className="text-sm text-zinc-600">
              {action.content}
            </p>
          ))}
          {actionPhotos.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {actionPhotos.map((photo) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={photo.id}
                  src={photo.url}
                  alt="조치 후 사진"
                  className="aspect-square rounded-lg object-cover"
                />
              ))}
            </div>
          )}
        </Card>
      )}
    </main>
  );
}
