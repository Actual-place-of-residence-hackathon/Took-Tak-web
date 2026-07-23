import type { ReportStatus, ReportUrgency } from "@/shared/types/report";

const statusClasses: Record<ReportStatus, string> = {
  접수: "bg-zinc-100 text-zinc-600",
  확인중: "bg-blue-100 text-blue-700",
  처리중: "bg-amber-100 text-amber-700",
  완료: "bg-emerald-100 text-emerald-700",
  보류: "bg-rose-100 text-rose-700",
};

const urgencyClasses: Record<ReportUrgency, string> = {
  상: "bg-rose-500 text-white",
  중: "bg-amber-500 text-white",
  하: "bg-emerald-500 text-white",
};

export function StatusBadge({ status }: { status: ReportStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses[status]}`}
    >
      {status}
    </span>
  );
}

export function UrgencyBadge({ urgency }: { urgency: ReportUrgency }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${urgencyClasses[urgency]}`}
    >
      긴급도 {urgency}
    </span>
  );
}

export function urgencyDotColor(urgency: ReportUrgency): string {
  return { 상: "bg-rose-500", 중: "bg-amber-500", 하: "bg-emerald-500" }[urgency];
}
