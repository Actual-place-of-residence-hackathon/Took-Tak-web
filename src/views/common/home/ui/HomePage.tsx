"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SiteMap } from "@/widgets/site-map";
import { useLocationTree } from "@/shared/lib/use-location-tree";
import type { ReportUrgency } from "@/shared/types/report";
import { Sheet } from "@/shared/ui";
import { ReportCreateForm } from "@/features/report-create";

interface PendingZone {
  buildingId: string;
  floorId: string;
  zoneId: string;
}

type UrgencyOption = ReportUrgency | "전체";

const URGENCY_FILTERS: { value: UrgencyOption; label: string; activeClass: string }[] = [
  { value: "전체", label: "전체", activeClass: "bg-zinc-700 text-white" },
  { value: "high", label: "상", activeClass: "bg-rose-600 text-white" },
  { value: "medium", label: "중", activeClass: "bg-amber-500 text-white" },
  { value: "low", label: "하", activeClass: "bg-emerald-500 text-white" },
];

function UrgencyFilter({
  value,
  onChange,
}: {
  value: UrgencyOption;
  onChange: (value: UrgencyOption) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {URGENCY_FILTERS.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-150 active:scale-95 ${
              active ? option.activeClass : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function HomePage() {
  const router = useRouter();
  const { data: buildings } = useLocationTree();
  const [pendingZone, setPendingZone] = useState<PendingZone | null>(null);
  const [urgency, setUrgency] = useState<UrgencyOption>("전체");

  function handleSelectZone(buildingId: string, floorId: string, zoneId: string) {
    setPendingZone({ buildingId, floorId, zoneId });
  }

  function handleSuccess() {
    setPendingZone(null);
  }

  const building = buildings?.find((b) => b.id === pendingZone?.buildingId);
  const floor = building?.floors.find((f) => f.id === pendingZone?.floorId);
  const zone = floor?.zones.find((z) => z.id === pendingZone?.zoneId);

  const initialLocation =
    pendingZone && building && floor && zone
      ? {
          buildingId: building.id,
          floorId: floor.id,
          zoneId: zone.id,
          buildingName: building.name,
          floorName: floor.name,
          zoneName: zone.name,
        }
      : undefined;

  return (
    <main className="animate-tt-fade-in flex w-full flex-1 flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-primary-800 text-2xl font-semibold">
          배치도를 눌러 신고 위치를 선택해주세요
        </h1>
        <p className="text-sm text-zinc-500">
          건물과 층을 고른 뒤, 배치도 위 구역 핀을 누르면 신고 작성 창이 열려요.
        </p>
      </div>

      <SiteMap
        mode="place"
        onSelectZone={handleSelectZone}
        selectedZoneId={pendingZone?.zoneId ?? null}
        onPinClick={(report) => router.push(`/report/${report.id}`)}
        urgencyFilter={urgency === "전체" ? undefined : urgency}
        rightControls={<UrgencyFilter value={urgency} onChange={setUrgency} />}
      />

      <Sheet open={Boolean(pendingZone)} onClose={() => setPendingZone(null)} title="신고 작성">
        {initialLocation && (
          <ReportCreateForm initialLocation={initialLocation} onSuccess={handleSuccess} />
        )}
      </Sheet>
    </main>
  );
}
