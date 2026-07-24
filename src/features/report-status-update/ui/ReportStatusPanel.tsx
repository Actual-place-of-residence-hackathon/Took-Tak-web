"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  useMergeReports,
  useOverrideClassification,
  useReports,
  useSubmitAction,
  useUpdateReportStatus,
} from "@/entities/report";
import {
  REPORT_CATEGORIES,
  REPORT_STATUS_LABELS,
  REPORT_URGENCY_LABELS,
  type Report,
  type ReportCategory,
  type ReportStatus,
  type ReportUrgency,
} from "@/shared/types/report";
import { reportLocationLabel } from "@/shared/lib/report-location";
import { Button, Dropdown, StatusBadge, Textarea, UrgencyBadge } from "@/shared/ui";

const STATUS_OPTIONS: ReportStatus[] = ["received", "checking", "processing", "done", "hold"];
const CATEGORY_DROPDOWN_OPTIONS = REPORT_CATEGORIES.map((c) => ({ value: c, label: c }));
const URGENCY_DROPDOWN_OPTIONS: { value: ReportUrgency; label: string }[] = [
  { value: "high", label: REPORT_URGENCY_LABELS.high },
  { value: "medium", label: REPORT_URGENCY_LABELS.medium },
  { value: "low", label: REPORT_URGENCY_LABELS.low },
];
const STATUS_DROPDOWN_OPTIONS = STATUS_OPTIONS.map((s) => ({
  value: s,
  label: REPORT_STATUS_LABELS[s],
}));

export function ReportStatusPanel({
  report,
  onStatusChanged,
}: {
  report: Report;
  onStatusChanged?: () => void;
}) {
  const overrideClassification = useOverrideClassification();
  const updateStatus = useUpdateReportStatus();
  const submitAction = useSubmitAction();
  const mergeReports = useMergeReports();

  // 같은 구역(zone)의 다른 미완료 신고를 유사 신고 후보로 봅니다.
  // (C2/A4 도 zone_id 단위로 중복을 판정합니다)
  const { data: allReports = [] } = useReports();
  const similarReports = allReports.filter(
    (r) =>
      report.zoneId !== null &&
      r.zoneId === report.zoneId &&
      r.id !== report.id &&
      r.status !== "done",
  );

  const [category, setCategory] = useState<ReportCategory>(report.category ?? "기타");
  const [urgency, setUrgency] = useState<ReportUrgency>(report.urgency ?? "medium");
  const [nextStatus, setNextStatus] = useState<ReportStatus>(report.status);
  const [note, setNote] = useState("");
  const [actionContent, setActionContent] = useState("");
  const [selectedMergeIds, setSelectedMergeIds] = useState<string[]>([]);

  return (
    <div className="flex flex-col gap-6">
      <section>
        <div className="mb-2 flex items-center gap-2">
          <StatusBadge status={report.status} />
          {report.urgency && <UrgencyBadge urgency={report.urgency} />}
        </div>
        <p className="font-medium text-zinc-800">{reportLocationLabel(report)}</p>
        <p className="mt-1 text-sm whitespace-pre-line text-zinc-600">{report.description}</p>
        {report.photos.length > 0 && (
          <div className="mt-2 grid grid-cols-3 gap-2">
            {report.photos.map((photo) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={photo.id}
                src={photo.url}
                alt=""
                className="aspect-square rounded-lg object-cover"
              />
            ))}
          </div>
        )}
        {report.aiReason && (
          <p className="mt-2 text-xs text-zinc-400">AI 분류 근거: {report.aiReason}</p>
        )}
      </section>

      <section className="flex flex-col gap-2 border-t border-zinc-200 pt-4">
        <h3 className="text-sm font-semibold text-zinc-700">수동 오버라이드</h3>
        <div className="grid grid-cols-2 gap-2">
          <Dropdown
            value={category}
            options={CATEGORY_DROPDOWN_OPTIONS}
            onChange={(v) => setCategory(v as ReportCategory)}
          />
          <Dropdown
            value={urgency}
            options={URGENCY_DROPDOWN_OPTIONS}
            onChange={(v) => setUrgency(v as ReportUrgency)}
          />
        </div>
        <Button
          size="sm"
          variant="secondary"
          disabled={overrideClassification.isPending}
          onClick={async () => {
            try {
              await overrideClassification.mutateAsync({ id: report.id, category, urgency });
              toast.success("분류를 수정했습니다.");
            } catch {
              toast.error("분류 수정에 실패했습니다.");
            }
          }}
        >
          분류 저장
        </Button>
      </section>

      {similarReports.length > 0 && (
        <section className="flex flex-col gap-2 border-t border-zinc-200 pt-4">
          <h3 className="text-sm font-semibold text-zinc-700">
            같은 구역의 다른 신고 ({similarReports.length}건)
          </h3>
          <div className="flex flex-col gap-1">
            {similarReports.map((r) => (
              <label key={r.id} className="flex items-center gap-2 text-sm text-zinc-600">
                <input
                  type="checkbox"
                  checked={selectedMergeIds.includes(r.id)}
                  onChange={(e) =>
                    setSelectedMergeIds((prev) =>
                      e.target.checked ? [...prev, r.id] : prev.filter((id) => id !== r.id),
                    )
                  }
                />
                {(r.description ?? "").slice(0, 30)}
              </label>
            ))}
          </div>
          <Button
            size="sm"
            variant="secondary"
            disabled={selectedMergeIds.length === 0 || mergeReports.isPending}
            onClick={async () => {
              try {
                await mergeReports.mutateAsync({ reportIds: [report.id, ...selectedMergeIds] });
                setSelectedMergeIds([]);
                toast.success("유사 신고를 병합했습니다.");
              } catch {
                toast.error("신고 병합에 실패했습니다.");
              }
            }}
          >
            선택한 신고 병합
          </Button>
        </section>
      )}

      <section className="flex flex-col gap-2 border-t border-zinc-200 pt-4">
        <h3 className="text-sm font-semibold text-zinc-700">상태 변경</h3>
        <Dropdown
          value={nextStatus}
          options={STATUS_DROPDOWN_OPTIONS}
          onChange={(v) => setNextStatus(v as ReportStatus)}
        />
        <Textarea
          placeholder="변경 사유 (선택)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="min-h-16"
        />

        {nextStatus === "done" && (
          <Textarea
            label="조치 내용 (필수)"
            placeholder="어떻게 조치했는지 입력해주세요."
            value={actionContent}
            onChange={(e) => setActionContent(e.target.value)}
          />
        )}

        <Button
          size="sm"
          disabled={submitAction.isPending || updateStatus.isPending}
          onClick={async () => {
            if (nextStatus === "done") {
              if (!actionContent.trim()) {
                toast.error("조치 내용을 입력해주세요.");
                return;
              }
              try {
                await submitAction.mutateAsync({ id: report.id, content: actionContent });
                toast.success("완료 처리되었습니다.");
                onStatusChanged?.();
              } catch {
                toast.error("완료 처리에 실패했습니다.");
              }
              return;
            }
            try {
              await updateStatus.mutateAsync({
                id: report.id,
                status: nextStatus,
                note: note || undefined,
              });
              toast.success("상태를 변경했습니다.");
              onStatusChanged?.();
            } catch {
              toast.error("상태 변경에 실패했습니다.");
            }
          }}
        >
          상태 변경 적용
        </Button>
      </section>
    </div>
  );
}
