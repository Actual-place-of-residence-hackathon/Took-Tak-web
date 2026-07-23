import type { Report } from "@/shared/types/report";

export function reportLocationLabel(report: Report): string {
  return report.locationLabel ?? `${report.buildingName} ${report.floor}F`;
}

const URGENCY_BORDER_CLASSES = {
  상: "border-l-rose-500",
  중: "border-l-amber-500",
  하: "border-l-emerald-500",
} as const;

export function reportBorderClass(report: Report): string {
  if (report.status === "완료") return "border-l-emerald-500 opacity-70";
  return URGENCY_BORDER_CLASSES[report.urgency];
}
