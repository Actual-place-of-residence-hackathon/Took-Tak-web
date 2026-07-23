"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import type { Report } from "@/shared/types/report";
import { reportLocationLabel } from "@/shared/lib/report-location";
import { floorImageSrc, type BuildingId } from "@/shared/config/site-map";
import type { SiteMapMode } from "../model/types";

interface HotspotMarker {
  buildingId: string;
  floor: number;
  count: number;
  pinX: number;
  pinY: number;
}

interface PinMapProps {
  buildingId: BuildingId;
  floor: number;
  reports: Report[];
  mode: SiteMapMode;
  onPinClick?: (report: Report) => void;
  onPlacePin?: (x: number, y: number) => void;
  draftPin?: { x: number; y: number } | null;
  hotspots?: HotspotMarker[];
  hidePins?: boolean;
}

const PIN_BG_CLASSES = {
  상: "bg-rose-600",
  중: "bg-amber-500",
  하: "bg-emerald-500",
  완료: "bg-emerald-500",
} as const;

// 원의 중심이 곧 좌표(클릭 지점)이므로 -translate-x-1/2 -translate-y-1/2 로 정확히 그 지점에 앵커됩니다.
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
  buildingId,
  floor,
  reports,
  onPinClick,
  onPlacePin,
  draftPin,
  hotspots,
  hidePins,
}: PinMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    canvasRef.current = null;
    const img = new Image();
    img.src = floorImageSrc(buildingId, floor);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext("2d")?.drawImage(img, 0, 0);
      canvasRef.current = canvas;
    };
  }, [buildingId, floor]);

  function isEmptyMargin(xPercent: number, yPercent: number): boolean {
    const canvas = canvasRef.current;
    if (!canvas) return false;
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;
    const px = Math.min(canvas.width - 1, Math.max(0, Math.round((xPercent / 100) * canvas.width)));
    const py = Math.min(
      canvas.height - 1,
      Math.max(0, Math.round((yPercent / 100) * canvas.height)),
    );
    const [r, g, b, a] = ctx.getImageData(px, py, 1, 1).data;
    if (a < 10) return true;
    return r > 246 && g > 246 && b > 246;
  }

  function handleImageClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!onPlacePin || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));

    if (isEmptyMargin(x, y)) {
      toast.info("배치도 안쪽 위치를 선택해주세요.");
      return;
    }

    onPlacePin(x, y);
  }

  return (
    <div
      ref={containerRef}
      onClick={handleImageClick}
      className={`relative mx-auto w-full ${onPlacePin ? "cursor-crosshair" : ""}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={floorImageSrc(buildingId, floor)}
        alt={`${buildingId} ${floor}F 배치도`}
        className="pointer-events-none block h-auto w-full select-none"
        draggable={false}
      />

      {hotspots?.map((hotspot) => (
        <div
          key={`${hotspot.buildingId}-${hotspot.floor}-${hotspot.count}-${hotspot.pinX}-${hotspot.pinY}`}
          className="absolute"
          style={{ left: `${hotspot.pinX}%`, top: `${hotspot.pinY}%` }}
        >
          <Hotspot count={hotspot.count} />
        </div>
      ))}

      {!hidePins &&
        reports.map((report) => (
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
                {report.category} · 긴급도 {report.urgency}
              </span>
              <span className="block max-w-56 truncate text-zinc-300">{report.description}</span>
            </span>
            <Pin
              colorClassName={PIN_BG_CLASSES[report.status === "완료" ? "완료" : report.urgency]}
            />
          </button>
        ))}

      {draftPin && (
        <span
          key={`${draftPin.x}-${draftPin.y}`}
          className="animate-tt-pin-drop pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${draftPin.x}%`, top: `${draftPin.y}%` }}
        >
          <Pin colorClassName="bg-primary-600" size={24} />
        </span>
      )}
    </div>
  );
}
