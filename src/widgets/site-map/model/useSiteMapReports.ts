"use client";

import { useEffect, useMemo, useState } from "react";
import { useReports } from "@/entities/report";
import type { ReportUrgency } from "@/shared/types/report";

const COMPLETED_VISIBLE_MS = 24 * 60 * 60 * 1000; // 완료 후 1일간만 핀 유지

export function useSiteMapReports(buildingId: string, floor: number, urgency?: ReportUrgency) {
  const { data: allReports = [], isLoading } = useReports({ buildingId, floor, urgency });
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    queueMicrotask(() => setNow(Date.now()));
  }, []);

  const reports = useMemo(() => {
    if (now === null) return allReports;
    return allReports.filter((report) => {
      if (report.status !== "완료") return true;
      const completedAt = report.statusHistory.find((h) => h.status === "완료")?.changedAt;
      if (!completedAt) return true;
      return now - new Date(completedAt).getTime() <= COMPLETED_VISIBLE_MS;
    });
  }, [allReports, now]);

  return { reports, isLoading };
}
