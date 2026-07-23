"use client";

import { useState, type ReactNode } from "react";
import { BUILDINGS, type BuildingId } from "@/shared/config/site-map";
import type { Report, ReportUrgency } from "@/shared/types/report";
import { useSiteMapReports } from "../model/useSiteMapReports";
import type { SiteMapMode } from "../model/types";
import { BuildingTabs } from "./BuildingTabs";
import { FloorTabs } from "./FloorTabs";
import { PinMap } from "./PinMap";

interface HotspotMarker {
  buildingId: string;
  floor: number;
  count: number;
  pinX: number;
  pinY: number;
}

interface SiteMapProps {
  mode?: SiteMapMode;
  onPinClick?: (report: Report) => void;
  onPlacePin?: (buildingId: BuildingId, floor: number, x: number, y: number) => void;
  draftPin?: { x: number; y: number } | null;
  urgencyFilter?: ReportUrgency;
  rightControls?: ReactNode;
  hotspots?: HotspotMarker[];
  hidePins?: boolean;
}

export function SiteMap({
  mode = "browse",
  onPinClick,
  onPlacePin,
  draftPin,
  urgencyFilter,
  rightControls,
  hotspots,
  hidePins,
}: SiteMapProps) {
  const [buildingId, setBuildingId] = useState<BuildingId>(BUILDINGS[0].id);
  const [floor, setFloor] = useState(BUILDINGS[0].floors[0]);

  const building = BUILDINGS.find((b) => b.id === buildingId) ?? BUILDINGS[0];
  const { reports } = useSiteMapReports(buildingId, floor, urgencyFilter);
  const visibleHotspots = hotspots?.filter((h) => h.buildingId === buildingId && h.floor === floor);

  function handleBuildingChange(id: BuildingId) {
    const next = BUILDINGS.find((b) => b.id === id);
    setBuildingId(id);
    setFloor(next?.floors[0] ?? 1);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div />
        <BuildingTabs value={buildingId} onChange={handleBuildingChange} />
        <div className="flex justify-end">{rightControls}</div>
      </div>
      <div className="flex justify-center">
        <FloorTabs floors={building.floors} value={floor} onChange={setFloor} />
      </div>

      <PinMap
        buildingId={buildingId}
        floor={floor}
        reports={reports}
        mode={mode}
        onPinClick={onPinClick}
        onPlacePin={onPlacePin ? (x, y) => onPlacePin(buildingId, floor, x, y) : undefined}
        draftPin={draftPin}
        hotspots={visibleHotspots}
        hidePins={hidePins}
      />

      {mode === "place" && (
        <p className="-mt-2 text-center text-xs text-zinc-400">
          배치도를 눌러 신고 위치를 핀으로 찍어주세요.
        </p>
      )}
    </div>
  );
}
