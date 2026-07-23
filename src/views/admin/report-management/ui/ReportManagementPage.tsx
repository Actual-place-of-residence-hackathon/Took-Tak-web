"use client";

import { useState } from "react";
import { useReports } from "@/entities/report";
import { ReportFilterBar } from "@/features/report-filter";
import { ReportStatusPanel } from "@/features/report-status-update";
import type { Report, ReportFilter } from "@/shared/types/report";
import { reportBorderClass, reportLocationLabel } from "@/shared/lib/report-location";
import { BackButton, Card, EmptyState, Sheet, StatusBadge, UrgencyBadge } from "@/shared/ui";

export function ReportManagementPage() {
  const [filter, setFilter] = useState<ReportFilter>({ sort: "latest" });
  const [selected, setSelected] = useState<Report | null>(null);
  const { data: reports = [], isLoading } = useReports(filter);

  return (
    <main className="animate-tt-fade-in mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8">
      <BackButton />
      <h1 className="text-2xl font-semibold text-zinc-800">신고 관리</h1>
      <ReportFilterBar filter={filter} onChange={setFilter} />

      {!isLoading && reports.length === 0 ? (
        <EmptyState message="조건에 맞는 신고가 없습니다." />
      ) : (
        <div className="flex flex-col gap-2">
          {reports.map((report) => (
            <button key={report.id} onClick={() => setSelected(report)} className="text-left">
              <Card
                className={`flex items-center justify-between border-l-4 hover:border-zinc-300 ${reportBorderClass(report)}`}
              >
                <div>
                  <div className="mb-1 flex items-center gap-1.5">
                    <StatusBadge status={report.status} />
                    <UrgencyBadge urgency={report.urgency} />
                  </div>
                  <p className="text-sm font-medium text-zinc-800">{reportLocationLabel(report)}</p>
                  <p className="line-clamp-1 text-xs text-zinc-500">{report.description}</p>
                </div>
                <span className="text-xs text-zinc-400">{report.category}</span>
              </Card>
            </button>
          ))}
        </div>
      )}

      <Sheet open={Boolean(selected)} onClose={() => setSelected(null)} title="신고 상세">
        {selected && <ReportStatusPanel report={selected} />}
      </Sheet>
    </main>
  );
}
