"use client";

import { useState } from "react";
import Link from "next/link";
import { useReports } from "@/entities/report";
import { ReportFilterBar } from "@/features/report-filter";
import type { ReportFilter } from "@/shared/types/report";
import { reportLocationLabel } from "@/shared/lib/report-location";
import { BackButton, Card, EmptyState, StatusBadge, UrgencyBadge } from "@/shared/ui";

export function ReportListPage() {
  const [filter, setFilter] = useState<ReportFilter>({ sort: "latest" });
  const { data: reports = [], isLoading } = useReports(filter);

  return (
    <main className="animate-tt-fade-in mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8">
      <BackButton />
      <div>
        <h1 className="text-2xl font-semibold text-zinc-800">신고 목록</h1>
        <p className="mt-1 text-sm text-zinc-500">지금까지 접수된 모든 신고를 확인할 수 있어요.</p>
      </div>

      <ReportFilterBar filter={filter} onChange={setFilter} />

      {!isLoading && reports.length === 0 ? (
        <EmptyState message="조건에 맞는 신고가 없습니다." />
      ) : (
        <div className="flex flex-col gap-2">
          {reports.map((report) => (
            <Link key={report.id} href={`/report/${report.id}`}>
              <Card className="flex gap-3 hover:border-zinc-300">
                {report.photos[0] && (
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={report.photos[0].url} alt="" className="h-full w-full object-cover" />
                  </div>
                )}
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-center gap-1.5">
                    <StatusBadge status={report.status} />
                    <UrgencyBadge urgency={report.urgency} />
                  </div>
                  <p className="text-sm font-medium text-zinc-800">{reportLocationLabel(report)}</p>
                  <p className="line-clamp-1 text-xs text-zinc-500">{report.description}</p>
                  <p className="text-xs text-zinc-400">
                    {new Date(report.createdAt).toLocaleDateString("ko-KR")}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
