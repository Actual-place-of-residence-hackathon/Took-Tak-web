"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SiteMap } from "@/widgets/site-map";
import type { BuildingId } from "@/shared/config/site-map";
import type { ReportUrgency } from "@/shared/types/report";
import { Sheet } from "@/shared/ui";
import { ReportCreateForm } from "@/features/report-create";

interface PendingPin {
  buildingId: BuildingId;
  floor: number;
  x: number;
  y: number;
}

type UrgencyOption = ReportUrgency | "전체";

const URGENCY_FILTERS: { value: UrgencyOption; label: string; activeClass: string }[] = [
  { value: "전체", label: "전체", activeClass: "bg-zinc-700 text-white" },
  { value: "상", label: "상", activeClass: "bg-rose-600 text-white" },
  { value: "중", label: "중", activeClass: "bg-amber-500 text-white" },
  { value: "하", label: "하", activeClass: "bg-emerald-500 text-white" },
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
  const [pendingPin, setPendingPin] = useState<PendingPin | null>(null);
  const [urgency, setUrgency] = useState<UrgencyOption>("전체");

  function handlePlacePin(buildingId: BuildingId, floor: number, x: number, y: number) {
    setPendingPin({ buildingId, floor, x, y });
  }

  function handleSuccess() {
    setPendingPin(null);
  }

  return (
    <main className="animate-tt-fade-in flex w-full flex-1 flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-primary-800 text-2xl font-semibold">
          배치도를 눌러 신고 위치를 찍어주세요
        </h1>
        <p className="text-sm text-zinc-500">
          건물과 층을 고른 뒤, 불편한 위치를 배치도 위에서 직접 클릭하면 신고 작성 창이 열려요.
        </p>
      </div>

      <SiteMap
        mode="place"
        onPlacePin={handlePlacePin}
        onPinClick={(report) => router.push(`/report/${report.id}`)}
        draftPin={pendingPin ? { x: pendingPin.x, y: pendingPin.y } : null}
        urgencyFilter={urgency === "전체" ? undefined : urgency}
        rightControls={<UrgencyFilter value={urgency} onChange={setUrgency} />}
      />

      <Sheet open={Boolean(pendingPin)} onClose={() => setPendingPin(null)} title="신고 작성">
        {pendingPin && <ReportCreateForm initialLocation={pendingPin} onSuccess={handleSuccess} />}
      </Sheet>
    </main>
  );
}
