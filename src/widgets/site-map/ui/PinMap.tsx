"use client";

import { useEffect, useState } from "react";
import type { Report } from "@/shared/types/report";
import { reportLocationLabel } from "@/shared/lib/report-location";
import { floorImageSrc } from "@/shared/config/site-map";
import type { SiteMapZone } from "../model/types";
import type { SiteMapMode } from "../model/types";

interface HotspotMarker {
  zoneId: string;
  count: number;
  pinX: number;
  pinY: number;
}

interface PinMapProps {
  buildingName: string;
  floorName: string;
  // mode === "place" 일 때 선택 가능한 zone 목록(고정 좌표). 학생은 이 중
  // 하나를 탭해서 신고 위치로 선택합니다 — 임의 좌표를 찍지 않습니다.
  zones: SiteMapZone[];
  reports: Report[];
  mode: SiteMapMode;
  onPinClick?: (report: Report) => void;
  onSelectZone?: (zoneId: string) => void;
  selectedZoneId?: string | null;
  hotspots?: HotspotMarker[];
  hidePins?: boolean;
}

const PIN_BG_CLASSES = {
  high: "bg-rose-600",
  medium: "bg-amber-500",
  low: "bg-emerald-500",
  done: "bg-emerald-500",
  neutral: "bg-zinc-400",
} as const;

function Pin({ colorClassName, size = 20 }: { colorClassName: string; size?: number }) {
  return (
    <span
      className={`block shrink-0 rounded-full border-2 border-white shadow-md transition-transform duration-150 group-hover:scale-125 ${colorClassName}`}
      style={{ width: size, height: size }}
    />
  );
}

function Hotspot({ count }: { count: number }) {
  return (
    <div className="pointer-events-none absolute flex -translate-x-1/2 -translate-y-full flex-col items-center gap-1">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-600 text-lg font-bold text-white shadow-xl ring-2 ring-white">
        !
      </div>
      <div className="flex min-w-[2.5rem] items-center justify-center rounded-full bg-white px-2 py-0.5 text-center text-[11px] font-semibold text-rose-700 shadow-sm ring-1 ring-zinc-200">
        {count}건
      </div>
    </div>
  );
}

export function PinMap({
  buildingName,
  floorName,
  zones,
  reports,
  mode,
  onPinClick,
  onSelectZone,
  selectedZoneId,
  hotspots,
  hidePins,
}: PinMapProps) {
  const showZonePicker = mode === "place";

  // 백엔드는 zone_id 만 저장할 수 있어(임의 좌표 컬럼 없음) 실제로 신고에
  // 붙는 위치는 여전히 정해진 zone 중 하나입니다. 다만 사용자 입장에선 누른
  // 그 자리에 핀이 딱 찍혀야 하니, 클릭 좌표에 핀을 그대로 그려주고(시각적)
  // 그 좌표에서 가장 가까운 zone 을 내부적으로 선택합니다(실제 저장값).
  const [draftPin, setDraftPin] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setDraftPin(null);
  }, [buildingName, floorName]);

  function handleImageAreaClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!showZonePicker || !onSelectZone) return;

    const withCoords = zones.filter(
      (z): z is typeof z & { pinX: number; pinY: number } => z.pinX !== null && z.pinY !== null,
    );
    if (withCoords.length === 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    let nearest = withCoords[0];
    let nearestDistSq = Infinity;
    for (const zone of withCoords) {
      const dx = zone.pinX - x;
      const dy = zone.pinY - y;
      const distSq = dx * dx + dy * dy;
      if (distSq < nearestDistSq) {
        nearestDistSq = distSq;
        nearest = zone;
      }
    }
    setDraftPin({ x, y });
    onSelectZone(nearest.id);
  }

  return (
    <div
      className={`relative mx-auto w-full ${showZonePicker ? "cursor-crosshair" : ""}`}
      onClick={handleImageAreaClick}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={floorImageSrc(buildingName, floorName)}
        alt={`${buildingName} ${floorName} 배치도`}
        className="pointer-events-none block h-auto w-full select-none"
        draggable={false}
      />

      {hotspots?.map((hotspot) => (
        <div
          key={hotspot.zoneId}
          className="absolute"
          style={{ left: `${hotspot.pinX}%`, top: `${hotspot.pinY}%` }}
        >
          <Hotspot count={hotspot.count} />
        </div>
      ))}

      {showZonePicker &&
        zones
          .filter((zone) => zone.pinX !== null && zone.pinY !== null)
          .map((zone) => {
            const selected = zone.id === selectedZoneId;
            return (
              <button
                key={zone.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDraftPin({ x: zone.pinX as number, y: zone.pinY as number });
                  onSelectZone?.(zone.id);
                }}
                className="animate-tt-pin-drop group absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${zone.pinX}%`, top: `${zone.pinY}%` }}
              >
                <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 w-max -translate-x-1/2 rounded-lg bg-zinc-900 px-2.5 py-1.5 text-xs whitespace-nowrap text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
                  {zone.name}
                </span>
                <Pin colorClassName={selected ? "bg-primary-600" : "bg-zinc-400"} size={14} />
              </button>
            );
          })}

      {/* 사용자가 실제로 누른 위치에 그대로 찍히는 핀. 저장되는 값은 위에서
          내부적으로 고른 가장 가까운 zone 이지만, 시각적으로는 클릭한 자리에
          핀이 나와야 하니 그 좌표를 그대로 씁니다. */}
      {showZonePicker && draftPin && (
        <div
          className="animate-tt-pin-drop pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${draftPin.x}%`, top: `${draftPin.y}%` }}
        >
          <Pin colorClassName="bg-primary-600" size={26} />
        </div>
      )}

      {!showZonePicker &&
        !hidePins &&
        reports.map((report) => {
          if (report.pinX === null || report.pinY === null) return null;
          return (
            <button
              key={report.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPinClick?.(report);
              }}
              className="animate-tt-pin-drop group absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${report.pinX}%`, top: `${report.pinY}%` }}
            >
              <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 w-max max-w-56 -translate-x-1/2 rounded-lg bg-zinc-900 px-2.5 py-1.5 text-xs text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
                <span className="block font-medium">{reportLocationLabel(report)}</span>
                <span className="block text-zinc-300">
                  {report.category ?? "분류 대기"} · 긴급도 {report.urgency ?? "-"}
                </span>
                <span className="block max-w-56 truncate text-zinc-300">{report.description}</span>
              </span>
              <Pin
                colorClassName={
                  report.status === "done"
                    ? PIN_BG_CLASSES.done
                    : report.urgency
                      ? PIN_BG_CLASSES[report.urgency]
                      : PIN_BG_CLASSES.neutral
                }
              />
            </button>
          );
        })}
    </div>
  );
}
