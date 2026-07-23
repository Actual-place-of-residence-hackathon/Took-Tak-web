"use client";

import { useSearchParams } from "next/navigation";
import { ReportCreateForm } from "@/features/report-create";
import type { BuildingId } from "@/shared/config/site-map";
import { BackButton } from "@/shared/ui";

export function ReportCreatePage() {
  const searchParams = useSearchParams();
  const building = searchParams.get("building") as BuildingId | null;
  const floor = searchParams.get("floor");
  const x = searchParams.get("x");
  const y = searchParams.get("y");

  const initialLocation =
    building && floor && x && y
      ? { buildingId: building, floor: Number(floor), x: Number(x), y: Number(y) }
      : undefined;

  return (
    <main className="animate-tt-fade-in mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-8">
      <BackButton />
      <h1 className="text-2xl font-semibold text-zinc-800">신고 등록</h1>
      <ReportCreateForm initialLocation={initialLocation} />
    </main>
  );
}
