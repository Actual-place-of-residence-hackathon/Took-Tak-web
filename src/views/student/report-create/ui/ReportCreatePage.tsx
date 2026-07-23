"use client";

import { useSearchParams } from "next/navigation";
import { ReportCreateForm } from "@/features/report-create";
import { BackButton } from "@/shared/ui";

export function ReportCreatePage() {
  const searchParams = useSearchParams();
  const buildingId = searchParams.get("buildingId");
  const floorId = searchParams.get("floorId");
  const zoneId = searchParams.get("zoneId");
  const buildingName = searchParams.get("buildingName");
  const floorName = searchParams.get("floorName");
  const zoneName = searchParams.get("zoneName");

  const initialLocation =
    buildingId && floorId && zoneId && buildingName && floorName && zoneName
      ? { buildingId, floorId, zoneId, buildingName, floorName, zoneName }
      : undefined;

  return (
    <main className="animate-tt-fade-in mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-8">
      <BackButton />
      <h1 className="text-2xl font-semibold text-zinc-800">신고 등록</h1>
      <ReportCreateForm initialLocation={initialLocation} />
    </main>
  );
}
