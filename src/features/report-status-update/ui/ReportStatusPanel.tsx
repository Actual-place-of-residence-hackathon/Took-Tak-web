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
import { REPORT_CATEGORIES, type Report, type ReportStatus } from "@/shared/types/report";
import { reportLocationLabel } from "@/shared/lib/report-location";
import { Button, Dropdown, StatusBadge, Textarea, UrgencyBadge } from "@/shared/ui";

const STATUS_OPTIONS: ReportStatus[] = ["접수", "확인중", "처리중", "완료", "보류"];
const CATEGORY_DROPDOWN_OPTIONS = REPORT_CATEGORIES.map((c) => ({ value: c, label: c }));
const URGENCY_DROPDOWN_OPTIONS = [
  { value: "상", label: "상" },
  { value: "중", label: "중" },
  { value: "하", label: "하" },
];
const STATUS_DROPDOWN_OPTIONS = STATUS_OPTIONS.map((s) => ({ value: s, label: s }));

export function ReportStatusPanel({ report }: { report: Report }) {
  const overrideClassification = useOverrideClassification();
  const updateStatus = useUpdateReportStatus();
  const submitAction = useSubmitAction();
  const mergeReports = useMergeReports();

  const { data: allReports = [] } = useReports();
  const similarReports = allReports.filter(
    (r) =>
      r.buildingId === report.buildingId &&
      r.floor === report.floor &&
      r.id !== report.id &&
      r.status !== "완료",
  );

  const [category, setCategory] = useState(report.category);
  const [urgency, setUrgency] = useState(report.urgency);
  const [nextStatus, setNextStatus] = useState<ReportStatus>(report.status);
  const [note, setNote] = useState("");
  const [actionNote, setActionNote] = useState(report.actionNote ?? "");
  const [selectedMergeIds, setSelectedMergeIds] = useState<string[]>([]);

  return (
    <div className="flex flex-col gap-6">
      <section>
        <div className="mb-2 flex items-center gap-2">
          <StatusBadge status={report.status} />
          <UrgencyBadge urgency={report.urgency} />
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
        <p className="mt-2 text-xs text-zinc-400">AI 분류 근거: {report.aiReason}</p>
      </section>

      <section className="flex flex-col gap-2 border-t border-zinc-200 pt-4">
        <h3 className="text-sm font-semibold text-zinc-700">수동 오버라이드</h3>
        <div className="grid grid-cols-2 gap-2">
          <Dropdown
            value={category}
            options={CATEGORY_DROPDOWN_OPTIONS}
            onChange={(v) => setCategory(v as Report["category"])}
          />
          <Dropdown
            value={urgency}
            options={URGENCY_DROPDOWN_OPTIONS}
            onChange={(v) => setUrgency(v as Report["urgency"])}
          />
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            overrideClassification.mutate({ id: report.id, category, urgency });
            toast.success("분류를 수정했습니다.");
          }}
        >
          분류 저장
        </Button>
      </section>

      {similarReports.length > 0 && (
        <section className="flex flex-col gap-2 border-t border-zinc-200 pt-4">
          <h3 className="text-sm font-semibold text-zinc-700">
            같은 층의 다른 신고 ({similarReports.length}건)
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
                {r.description.slice(0, 30)}
              </label>
            ))}
          </div>
          <Button
            size="sm"
            variant="secondary"
            disabled={selectedMergeIds.length === 0}
            onClick={() => {
              mergeReports.mutate({ primaryId: report.id, mergeIds: selectedMergeIds });
              setSelectedMergeIds([]);
              toast.success("유사 신고를 병합했습니다.");
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

        {nextStatus === "완료" && (
          <Textarea
            label="조치 내용 (필수)"
            placeholder="어떻게 조치했는지 입력해주세요."
            value={actionNote}
            onChange={(e) => setActionNote(e.target.value)}
          />
        )}

        <Button
          size="sm"
          onClick={() => {
            if (nextStatus === "완료") {
              if (!actionNote.trim()) {
                toast.error("조치 내용을 입력해주세요.");
                return;
              }
              submitAction.mutate({ id: report.id, actionNote, actionPhotos: report.actionPhotos });
              toast.success("완료 처리되었습니다.");
              return;
            }
            updateStatus.mutate({ id: report.id, status: nextStatus, note: note || undefined });
            toast.success("상태를 변경했습니다.");
          }}
        >
          상태 변경 적용
        </Button>
      </section>
    </div>
  );
}
