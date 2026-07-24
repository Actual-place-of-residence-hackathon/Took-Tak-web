"use client";

import { useState } from "react";
import type { Report } from "@/shared/types/report";
import { reportLocationLabel } from "@/shared/lib/report-location";
import { floorImageSrc } from "@/shared/config/site-map";
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
  // mode === "place" 일 때, 배치도 위 클릭한 자리가 그대로 자유 좌표(pinX/pinY)로
  // 선택됩니다.
  reports: Report[];
  mode: SiteMapMode;
  onPinClick?: (report: Report) => void;
  onSelectPin?: (pinX: number, pinY: number) => void;
  hotspots?: HotspotMarker[];
  hidePins?: boolean;
}

const PIN_BG_CLASSES = {
  high: "bg-red-600",
  medium: "bg-orange-500",
  low: "bg-yellow-400",
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
  reports,
  mode,
  onPinClick,
  onSelectPin,
  hotspots,
  hidePins,
}: PinMapProps) {
  const showZonePicker = mode === "place";

  // 클릭한 자리에 그대로 핀을 찍습니다(백엔드 reports.pin_x/pin_y, zone_id nullable).
  const [draftPin, setDraftPin] = useState<{ x: number; y: number } | null>(null);

  // 층/건물이 바뀌면 이전 화면에 찍었던 draft pin은 더 이상 의미가 없으니
  // 지워야 합니다. useEffect 로 하면 커밋 후 한 번 더 렌더링이 도는데,
  // React가 권장하는 "렌더링 중 상태 조정" 패턴을 쓰면 그 추가 렌더링 없이
  // 같은 커밋에서 바로 처리됩니다.
  const locationKey = `${buildingName}::${floorName}`;
  const [prevLocationKey, setPrevLocationKey] = useState(locationKey);
  if (locationKey !== prevLocationKey) {
    setPrevLocationKey(locationKey);
    setDraftPin(null);
  }

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

      {/* 사용자가 실제로 누른 위치에 찍히는 핀. */}
      {showZonePicker && draftPin && (
        <div
          className="animate-tt-pin-drop pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${draftPin.x}%`, top: `${draftPin.y}%` }}
        >
          <Pin colorClassName="bg-primary-600" size={26} />
        </div>
      )}

      {!hidePins &&
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
