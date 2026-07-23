import type { Report } from "@/shared/types/report";

export function reportLocationLabel(report: Report): string {
  return `${report.buildingName} ${report.floorName} ${report.zoneName}`;
}

const URGENCY_BORDER_CLASSES = {
  high: "border-l-rose-500",
  medium: "border-l-amber-500",
  low: "border-l-emerald-500",
} as const;

export function reportBorderClass(report: Report): string {
  if (report.status === "done") return "border-l-emerald-500 opacity-70";
  if (!report.urgency) return "border-l-zinc-300";
  return URGENCY_BORDER_CLASSES[report.urgency];
}
