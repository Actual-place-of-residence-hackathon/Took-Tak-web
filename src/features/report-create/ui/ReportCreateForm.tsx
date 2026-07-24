"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useCreateReport } from "@/entities/report";
import { useLocationTree } from "@/shared/lib/use-location-tree";
import type { ReportPhoto } from "@/shared/types/report";
import { Button, Card, Textarea } from "@/shared/ui";
import { SiteMap } from "@/widgets/site-map";
import { reportCreateSchema, type ReportCreateFormValues } from "../model/schema";
import { PhotoUploader } from "./PhotoUploader";

interface InitialLocation {
  buildingId: string;
  floorId: string;
  zoneId: string;
  buildingName: string;
  floorName: string;
  zoneName: string;
}

export function ReportCreateForm({
  initialLocation,
  onSuccess,
}: {
  initialLocation?: InitialLocation;
  onSuccess?: (reportId: string) => void;
}) {
  const router = useRouter();
  const createReport = useCreateReport();
  const { data: buildings } = useLocationTree();
  const [photos, setPhotos] = useState<ReportPhoto[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ReportCreateFormValues>({
    resolver: zodResolver(reportCreateSchema),
    defaultValues: {
      buildingId: initialLocation?.buildingId ?? "",
      floorId: initialLocation?.floorId ?? "",
      zoneId: initialLocation?.zoneId ?? undefined,
      description: "",
    },
  });

  const buildingId = watch("buildingId");
  const floorId = watch("floorId");
  const zoneId = watch("zoneId");
  const pinX = watch("pinX");
  const pinY = watch("pinY");
  const hasLocation = Boolean(zoneId) || (pinX !== undefined && pinY !== undefined);

  // 선택된 위치의 이름은 initialLocation(고정 prop)이 아니라 현재 폼 값으로부터
  // 매번 다시 구합니다 — 사용자가 아래 지도에서 다른 구역을 다시 고르면
  // buildingId/floorId/zoneId 만 바뀌고 initialLocation 은 그대로라, prop 값을
  // 그대로 표시하면 실제 선택과 화면 표시가 어긋납니다.
  const selectedBuilding = buildings?.find((b) => b.id === buildingId);
  const selectedFloor = selectedBuilding?.floors.find((f) => f.id === floorId);
  const selectedZone = selectedFloor?.zones.find((z) => z.id === zoneId);

  function handleSelectZone(buildingId: string, floorId: string, selectedZoneId: string) {
    setValue("buildingId", buildingId);
    setValue("floorId", floorId);
    setValue("zoneId", selectedZoneId);
    setValue("pinX", undefined);
    setValue("pinY", undefined);
  }

  function handleSelectPin(buildingId: string, floorId: string, pinX: number, pinY: number) {
    setValue("buildingId", buildingId);
    setValue("floorId", floorId);
    setValue("zoneId", undefined);
    setValue("pinX", pinX);
    setValue("pinY", pinY);
  }

  async function onSubmit(values: ReportCreateFormValues) {
    // category/urgency/aiReason 은 보내지 않습니다 — 서버(Bedrock)가 등록 직후
    // 직접 생성하고, 클라이언트가 보내는 값은 어차피 무시됩니다.
    const report = await createReport.mutateAsync({
      buildingId: values.buildingId,
      floorId: values.floorId,
      zoneId: values.zoneId,
      pinX: values.pinX,
      pinY: values.pinY,
      part: values.part,
      description: values.description,
      photoUrls: photos.map((p) => p.url),
    });

    toast.success("신고가 접수되었습니다. AI 분류는 잠시 후 상세 화면에서 확인할 수 있어요.");
    if (onSuccess) {
      onSuccess(report.id);
    } else {
      router.push(`/report/${report.id}`);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <Card>
        <h2 className="font-semibold text-zinc-800">신고 위치</h2>
        {hasLocation ? (
          <p className="mt-2 text-zinc-600">
            {selectedBuilding?.name ?? initialLocation?.buildingName} ·{" "}
            {selectedFloor?.name ?? initialLocation?.floorName} ·{" "}
            {selectedZone?.name ?? initialLocation?.zoneName ?? "직접 선택한 위치"}
          </p>
        ) : (
          <p className="mt-2 text-sm text-zinc-400">배치도에서 신고 위치를 눌러 선택해주세요.</p>
        )}
        {errors.zoneId && <p className="mt-1 text-xs text-rose-500">{errors.zoneId.message}</p>}
        <div className="mt-4">
          <SiteMap
            mode="place"
            onSelectZone={handleSelectZone}
            onSelectPin={handleSelectPin}
            selectedZoneId={zoneId || null}
          />
        </div>
      </Card>

      <div>
        <p className="mb-2 text-sm text-zinc-500">사진 첨부 (선택)</p>
        <PhotoUploader photos={photos} onChange={setPhotos} />
      </div>

      <Card>
        <label className="flex flex-col gap-1 text-sm text-zinc-600">
          <span className="font-medium text-zinc-700">부위 (선택)</span>
          <input
            type="text"
            {...register("part")}
            className="focus:border-primary-500 focus:ring-primary-200 rounded-lg border border-zinc-300 px-3 py-2 text-zinc-800 focus:ring-2 focus:outline-none"
            placeholder="예: 천장, 창문, 콘센트"
          />
        </label>
      </Card>

      <Card>
        <Textarea
          label="상세 설명"
          maxLength={500}
          placeholder="어떤 문제인지 자세히 알려주세요."
          {...register("description")}
        />
        {errors.description && (
          <p className="mt-1 text-xs text-rose-500">{errors.description.message}</p>
        )}
      </Card>

      <Button type="submit" disabled={isSubmitting || createReport.isPending}>
        {isSubmitting || createReport.isPending ? "제출 중..." : "신고 제출하기"}
      </Button>
    </form>
  );
}
