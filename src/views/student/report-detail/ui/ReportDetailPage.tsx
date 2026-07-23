"use client";

import { toast } from "sonner";
import { useReport, useSubmitSatisfaction } from "@/entities/report";
import { reportLocationLabel } from "@/shared/lib/report-location";
import { BackButton, Button, Card, EmptyState, StatusBadge, UrgencyBadge } from "@/shared/ui";
import type { ReportStatus } from "@/shared/types/report";

const STEPS: ReportStatus[] = ["접수", "확인중", "처리중", "완료"];

export function ReportDetailPage({ reportId }: { reportId: string }) {
  const { data: report, isLoading } = useReport(reportId);
  const submitSatisfaction = useSubmitSatisfaction();

  if (isLoading) return <EmptyState message="불러오는 중입니다..." />;
  if (!report) return <EmptyState message="신고 내역을 찾을 수 없습니다." />;

  const stepIndex = STEPS.indexOf(report.status);

  return (
    <main className="animate-tt-fade-in mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8">
      <BackButton />
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <StatusBadge status={report.status} />
          <UrgencyBadge urgency={report.urgency} />
        </div>
        <h1 className="text-xl font-semibold text-zinc-800">{reportLocationLabel(report)}</h1>
        <p className="text-sm text-zinc-500">{report.category}</p>
      </div>

      <Card>
        <h2 className="mb-3 font-semibold text-zinc-800">처리 타임라인</h2>
        {report.status === "보류" ? (
          <p className="text-sm text-rose-500">
            보류됨 — {report.statusHistory.at(-1)?.note ?? "사유가 등록되지 않았습니다."}
          </p>
        ) : (
          <ol className="flex items-start">
            {STEPS.map((step, i) => {
              const entry = report.statusHistory.find((h) => h.status === step);
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
                    {step}
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
      </Card>

      <Card>
        <h2 className="mb-2 font-semibold text-zinc-800">신고 내용</h2>
        <p className="text-sm whitespace-pre-line text-zinc-600">{report.description}</p>
        {report.photos.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {report.photos.map((photo) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={photo.id}
                src={photo.url}
                alt={photo.name}
                className="aspect-square rounded-lg object-cover"
              />
            ))}
          </div>
        )}
      </Card>

      {report.status === "완료" && (
        <Card>
          <h2 className="mb-2 font-semibold text-zinc-800">조치 결과</h2>
          <p className="text-sm text-zinc-600">
            {report.actionNote ?? "등록된 조치 내용이 없습니다."}
          </p>
          {report.actionPhotos && report.actionPhotos.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {report.actionPhotos.map((photo) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={photo.id}
                  src={photo.url}
                  alt={photo.name}
                  className="aspect-square rounded-lg object-cover"
                />
              ))}
            </div>
          )}

          {report.satisfied === undefined ? (
            <div className="mt-4 flex items-center gap-2">
              <p className="flex-1 text-sm text-zinc-600">문제가 실제로 해결되었나요?</p>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  submitSatisfaction.mutate({ id: report.id, satisfied: true });
                  toast.success("피드백 감사합니다.");
                }}
              >
                예
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  submitSatisfaction.mutate({ id: report.id, satisfied: false });
                  toast.info("불편을 드려 죄송합니다. 담당자에게 다시 전달할게요.");
                }}
              >
                아니요
              </Button>
            </div>
          ) : (
            <p className="mt-4 text-sm text-zinc-500">
              만족도 응답: {report.satisfied ? "해결됨" : "미해결"}
            </p>
          )}
        </Card>
      )}
    </main>
  );
}
