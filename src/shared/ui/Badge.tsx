import {
  REPORT_STATUS_LABELS,
  REPORT_URGENCY_LABELS,
  type ReportStatus,
  type ReportUrgency,
} from "@/shared/types/report";

const statusClasses: Record<ReportStatus, string> = {
  received: "bg-zinc-100 text-zinc-600",
  checking: "bg-blue-100 text-blue-700",
  processing: "bg-amber-100 text-amber-700",
  done: "bg-emerald-100 text-emerald-700",
  hold: "bg-rose-100 text-rose-700",
};

const urgencyClasses: Record<ReportUrgency, string> = {
  high: "bg-rose-500 text-white",
  medium: "bg-amber-500 text-white",
  low: "bg-emerald-500 text-white",
};

export function StatusBadge({ status }: { status: ReportStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses[status]}`}
    >
      {REPORT_STATUS_LABELS[status]}
    </span>
  );
}

export function UrgencyBadge({ urgency }: { urgency: ReportUrgency }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${urgencyClasses[urgency]}`}
    >
      긴급도 {REPORT_URGENCY_LABELS[urgency]}
    </span>
  );
}

export function urgencyDotColor(urgency: ReportUrgency): string {
  return { high: "bg-rose-500", medium: "bg-amber-500", low: "bg-emerald-500" }[urgency];
}
