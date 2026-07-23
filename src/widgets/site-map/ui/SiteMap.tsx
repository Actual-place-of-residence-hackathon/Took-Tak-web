"use client";

import { useState, type ReactNode } from "react";
import { useLocationTree } from "@/shared/lib/use-location-tree";
import { Spinner } from "@/shared/ui";
import type { Report, ReportUrgency } from "@/shared/types/report";
import { useSiteMapReports } from "../model/useSiteMapReports";
import type { SiteMapMode } from "../model/types";
import { BuildingTabs } from "./BuildingTabs";
import { FloorTabs } from "./FloorTabs";
import { PinMap } from "./PinMap";

interface HotspotMarker {
  zoneId: string;
  buildingId: string;
  floorId: string;
  count: number;
  pinX: number;
  pinY: number;
}

interface SiteMapProps {
  mode?: SiteMapMode;
  onPinClick?: (report: Report) => void;
  // 학생은 배치도의 zone 핀 중 하나를 탭해서 신고 위치로 선택합니다
  // (임의 좌표를 찍지 않습니다 — 팀 결정 2026-07-24).
  onSelectZone?: (buildingId: string, floorId: string, zoneId: string) => void;
  selectedZoneId?: string | null;
  urgencyFilter?: ReportUrgency;
  rightControls?: ReactNode;
  hotspots?: HotspotMarker[];
  hidePins?: boolean;
}

export function SiteMap({
  mode = "browse",
  onPinClick,
  onSelectZone,
  selectedZoneId,
  urgencyFilter,
  rightControls,
  hotspots,
  hidePins,
}: SiteMapProps) {
  const { data: buildings, isLoading, isError } = useLocationTree();
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>("");
  const [selectedFloorId, setSelectedFloorId] = useState<string>("");

  // 트리가 로드되기 전엔 아직 선택된 게 없으니, 로드되면 첫 건물/첫 층을
  // 기본값으로 씁니다(사용자가 직접 고르면 selected*Id 가 그걸 덮어씁니다).
  const buildingId = selectedBuildingId || (buildings?.[0]?.id ?? "");
  const building = buildings?.find((b) => b.id === buildingId);
  const floorId = selectedFloorId || (building?.floors[0]?.id ?? "");
  const floor = building?.floors.find((f) => f.id === floorId);

  const { reports } = useSiteMapReports(buildingId, floorId, urgencyFilter);
  const visibleHotspots = hotspots?.filter(
    (h) => h.buildingId === buildingId && h.floorId === floorId,
  );

  function handleBuildingChange(id: string) {
    const next = buildings?.find((b) => b.id === id);
    setSelectedBuildingId(id);
    setSelectedFloorId(next?.floors[0]?.id ?? "");
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (isError || !buildings || buildings.length === 0 || !building || !floor) {
    return <p className="py-12 text-center text-sm text-zinc-400">배치도 정보를 불러오지 못했습니다.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div />
        <BuildingTabs buildings={buildings} value={buildingId} onChange={handleBuildingChange} />
        <div className="flex justify-end">{rightControls}</div>
      </div>
      <div className="flex justify-center">
        <FloorTabs floors={building.floors} value={floorId} onChange={setSelectedFloorId} />
      </div>

      <PinMap
        buildingName={building.name}
        floorName={floor.name}
        zones={floor.zones}
        reports={reports}
        mode={mode}
        onPinClick={onPinClick}
        onSelectZone={
          onSelectZone ? (zoneId) => onSelectZone(building.id, floor.id, zoneId) : undefined
        }
        selectedZoneId={selectedZoneId}
        hotspots={visibleHotspots}
        hidePins={hidePins}
      />

      {mode === "place" && (
        <p className="-mt-2 text-center text-xs text-zinc-400">
          배치도의 구역 핀을 눌러 신고 위치를 선택해주세요.
        </p>
      )}
    </div>
  );
}
