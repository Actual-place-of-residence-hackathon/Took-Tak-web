"use client";

import { useMemo } from "react";
import { useReports } from "@/entities/report";
import type { Report } from "@/shared/types/report";
import { BackButton, Card } from "@/shared/ui";
import { SiteMap } from "@/widgets/site-map";

function Bar({ label, count, max }: { label: string; count: number; max: number }) {
  const width = max === 0 ? 0 : Math.round((count / max) * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="w-32 shrink-0 truncate text-sm text-zinc-600">{label}</span>
      <div className="h-2.5 flex-1 rounded-full bg-zinc-100">
        <div className="bg-primary-500 h-2.5 rounded-full" style={{ width: `${width}%` }} />
      </div>
      <span className="w-8 shrink-0 text-right text-sm text-zinc-500">{count}</span>
    </div>
  );
}

function groupCount<T extends string>(reports: Report[], key: (r: Report) => T) {
  const map = new Map<T, number>();
  for (const r of reports) {
    map.set(key(r), (map.get(key(r)) ?? 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

export function StatisticsPage() {
  const { data: reports = [] } = useReports();

  const stats = useMemo(() => {
    const total = reports.length;
    const done = reports.filter((r) => r.status === "완료").length;
    const doneRate = total === 0 ? 0 : Math.round((done / total) * 100);

    const doneDurationsMs = reports
      .filter((r) => r.status === "완료")
      .map((r) => {
        const created = new Date(r.createdAt).getTime();
        const completed = new Date(
          r.statusHistory.find((h) => h.status === "완료")?.changedAt ?? r.createdAt,
        ).getTime();
        return completed - created;
      });
    const avgDays =
      doneDurationsMs.length === 0
        ? 0
        : Math.round(
            (doneDurationsMs.reduce((a, b) => a + b, 0) /
              doneDurationsMs.length /
              (1000 * 60 * 60 * 24)) *
              10,
          ) / 10;

    const byCategory = groupCount(reports, (r) => r.category);
    const byBuilding = groupCount(reports, (r) => r.buildingName);
    const byLocation = groupCount(reports, (r) => `${r.buildingName} ${r.floor}F`);

    const floorMap = new Map<
      string,
      { buildingId: string; floor: number; totalX: number; totalY: number; count: number }
    >();

    for (const report of reports) {
      const key = `${report.buildingId}-${report.floor}`;
      const current = floorMap.get(key) ?? {
        buildingId: report.buildingId,
        floor: report.floor,
        totalX: 0,
        totalY: 0,
        count: 0,
      };
      current.count += 1;
      current.totalX += report.pinX;
      current.totalY += report.pinY;
      floorMap.set(key, current);
    }

    const hotspotMarkers = [...floorMap.values()]
      .filter((entry) => entry.count >= 3)
      .map((entry) => ({
        buildingId: entry.buildingId,
        floor: entry.floor,
        count: entry.count,
        pinX: Math.round(entry.totalX / entry.count),
        pinY: Math.round(entry.totalY / entry.count),
      }));

    const hotspots = byLocation.filter(([, count]) => count >= 3);

    return {
      total,
      done,
      doneRate,
      avgDays,
      byCategory,
      byBuilding,
      hotspots,
      hotspotMarkers,
      byLocation,
    };
  }, [reports]);

  const maxCategory = stats.byCategory[0]?.[1] ?? 0;
  const maxBuilding = stats.byBuilding[0]?.[1] ?? 0;

  return (
    <main className="animate-tt-fade-in mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8">
      <BackButton />
      <div>
        <h1 className="text-2xl font-semibold text-zinc-800">통계</h1>
        <p className="mt-1 text-sm text-zinc-500">
          전체 신고 데이터를 기반으로 처리 현황과 다발 구역을 요약해서 보여줍니다.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center">
          <p className="text-2xl font-semibold text-zinc-800">{stats.total}</p>
          <p className="text-xs text-zinc-500">전체 신고</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-semibold text-zinc-800">{stats.doneRate}%</p>
          <p className="text-xs text-zinc-500">완료율</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-semibold text-zinc-800">{stats.avgDays}일</p>
          <p className="text-xs text-zinc-500">평균 처리 기간</p>
        </Card>
      </div>

      <Card>
        <h2 className="mb-3 font-semibold text-zinc-800">🔥 다발 이슈 구역 (3건 이상)</h2>
        {stats.hotspots.length === 0 ? (
          <p className="text-sm text-zinc-400">아직 3건 이상 누적된 구역이 없습니다.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {stats.hotspots.map(([location, count]) => (
              <li key={location} className="flex items-center justify-between text-sm">
                <span className="text-zinc-700">{location}</span>
                <span className="font-medium text-rose-600">{count}건</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <div className="mb-4 flex flex-col gap-2">
          <h2 className="font-semibold text-zinc-800">배치도에서 다발 구역 보기</h2>
          <p className="text-sm text-zinc-500">
            동일 건물·층에서 신고가 3건 이상인 구역에 느낌표 아이콘으로 표시합니다.
          </p>
        </div>
        {stats.hotspotMarkers.length === 0 ? (
          <p className="text-sm text-zinc-400">아직 다발 이슈로 표시할 배치도 구역이 없습니다.</p>
        ) : (
          <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-3">
            <SiteMap mode="browse" hotspots={stats.hotspotMarkers} hidePins />
          </div>
        )}
      </Card>

      <Card>
        <h2 className="mb-3 font-semibold text-zinc-800">유형별 신고 건수</h2>
        <div className="flex flex-col gap-2">
          {stats.byCategory.map(([category, count]) => (
            <Bar key={category} label={category} count={count} max={maxCategory} />
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 font-semibold text-zinc-800">건물별 신고 건수</h2>
        <div className="flex flex-col gap-2">
          {stats.byBuilding.map(([building, count]) => (
            <Bar key={building} label={building} count={count} max={maxBuilding} />
          ))}
        </div>
      </Card>
    </main>
  );
}
