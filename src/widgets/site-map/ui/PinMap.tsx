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
  // mode === "place" 일 때, 등록된 zone 핀을 탭하면 그 zone 이 선택됩니다.
  // 그 외의 자리를 클릭하면 자유 좌표(pinX/pinY)로 선택됩니다.
  zones: SiteMapZone[];
  reports: Report[];
  mode: SiteMapMode;
  onPinClick?: (report: Report) => void;
  onSelectZone?: (zoneId: string) => void;
  onSelectPin?: (pinX: number, pinY: number) => void;
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
  onSelectPin,
  selectedZoneId,
  hotspots,
  hidePins,
}: PinMapProps) {
  const showZonePicker = mode === "place";

  // 클릭한 자리에 그대로 핀을 찍습니다. 등록된 zone 핀을 직접 탭하면 그
  // zone 이 선택되고(고정 좌표), 그 외의 자리를 클릭하면 자유 좌표로
  // 선택됩니다(백엔드 reports.pin_x/pin_y, zone_id nullable).
  const [draftPin, setDraftPin] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setDraftPin(null);
  }, [buildingName, floorName]);

  function handleImageAreaClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!showZonePicker || !onSelectPin) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setDraftPin({ x, y });
    onSelectPin(x, y);
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
