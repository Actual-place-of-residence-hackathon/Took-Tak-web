"use client";

import { useMemo, useState } from "react";
import { useReports } from "@/entities/report";
import { ReportFilterBar } from "@/features/report-filter";
import { ReportStatusPanel } from "@/features/report-status-update";
import type { Report, ReportFilter } from "@/shared/types/report";
import { reportBorderClass, reportLocationLabel } from "@/shared/lib/report-location";
import { Card, Sheet, StatusBadge, Tabs, UrgencyBadge } from "@/shared/ui";
import { SiteMap } from "@/widgets/site-map";

function SummaryCounters({ reports }: { reports: Report[] }) {
  const today = new Date().toDateString();
  const todayCount = reports.filter((r) => new Date(r.createdAt).toDateString() === today).length;
  const urgentCount = reports.filter((r) => r.urgency === "high" && r.status !== "done").length;
  const inProgressCount = reports.filter((r) => r.status === "processing").length;
  const doneCount = reports.filter((r) => r.status === "done").length;

  const items = [
    { label: "오늘 접수", value: todayCount },
    { label: "긴급", value: urgentCount },
    { label: "처리중", value: inProgressCount },
    { label: "완료", value: doneCount },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} className="text-center">
          <p className="text-2xl font-semibold text-zinc-800">{item.value}</p>
          <p className="text-xs text-zinc-500">{item.label}</p>
        </Card>
      ))}
    </div>
  );
}

export function AdminDashboard() {
  const [view, setView] = useState<"list" | "map">("list");
  const [filter, setFilter] = useState<ReportFilter>({ sort: "urgency" });
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const { data: reports = [], isLoading } = useReports(filter);
  const { data: allReports = [] } = useReports();

  const selectedReport = useMemo(
    () => allReports.find((r) => r.id === selectedReportId) ?? null,
    [allReports, selectedReportId],
  );

  return (
    <div className="animate-tt-fade-in mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-semibold text-zinc-800">관리자 대시보드</h1>
      <SummaryCounters reports={allReports} />

      <Tabs
        value={view}
        onChange={setView}
        options={[
          { value: "list", label: "리스트 뷰" },
          { value: "map", label: "배치도 뷰" },
        ]}
      />

      {view === "list" ? (
        <div className="flex flex-col gap-4">
          <ReportFilterBar filter={filter} onChange={setFilter} />
          <div className="flex flex-col gap-2">
            {reports.map((report) => (
              <button
                key={report.id}
                onClick={() => setSelectedReportId(report.id)}
                className="text-left"
              >
                <ReportListItem report={report} />
              </button>
            ))}
          </div>
          {!isLoading && reports.length === 0 && (
            <p className="py-8 text-center text-sm text-zinc-400">조건에 맞는 신고가 없습니다.</p>
          )}
        </div>
      ) : (
        <div className="mt-6">
          <SiteMap mode="urgency" onPinClick={(report) => setSelectedReportId(report.id)} />
        </div>
      )}

      <Sheet
        open={Boolean(selectedReport)}
        onClose={() => setSelectedReportId(null)}
        title="신고 상세"
      >
        {selectedReport && (
          <ReportStatusPanel
            report={selectedReport}
            onStatusChanged={() => setSelectedReportId(null)}
          />
        )}
      </Sheet>
    </div>
  );
}

function ReportListItem({ report }: { report: Report }) {
  return (
    <Card className={`border-l-4 hover:border-zinc-300 ${reportBorderClass(report)}`}>
      <div className="mb-1 flex items-center gap-1.5">
        <StatusBadge status={report.status} />
        {report.urgency && <UrgencyBadge urgency={report.urgency} />}
      </div>
      <p className="text-sm font-medium text-zinc-800">{reportLocationLabel(report)}</p>
      <p className="line-clamp-1 text-xs text-zinc-500">{report.description}</p>
    </Card>
  );
}
