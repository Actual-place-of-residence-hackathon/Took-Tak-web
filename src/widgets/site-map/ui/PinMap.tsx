"use client";

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

  return (
    <div className="relative mx-auto w-full">
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
                  onSelectZone?.(zone.id);
                }}
                className="animate-tt-pin-drop group absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${zone.pinX}%`, top: `${zone.pinY}%` }}
              >
                <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 w-max -translate-x-1/2 rounded-lg bg-zinc-900 px-2.5 py-1.5 text-xs whitespace-nowrap text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
                  {zone.name}
                </span>
                <Pin
                  colorClassName={selected ? "bg-primary-600" : "bg-zinc-400"}
                  size={selected ? 24 : 18}
                />
              </button>
            );
          })}

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
