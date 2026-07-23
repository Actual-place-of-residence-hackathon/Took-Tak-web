"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useCreateReport, analyzeReport } from "@/entities/report";
import type { BuildingId } from "@/shared/config/site-map";
import { Button, Card, Dropdown, Textarea, Spinner } from "@/shared/ui";
import { SiteMap } from "@/widgets/site-map";
import type { ReportPhoto } from "@/shared/types/report";
import {
  REPORT_CATEGORIES,
  reportCreateSchema,
  type ReportCreateFormValues,
} from "../model/schema";
import { PhotoUploader } from "./PhotoUploader";

function buildingLabel(buildingId: string): string {
  return (
    { donghaeng: "동행관", geumbong: "금봉관", bongwan: "본관·실습동" }[buildingId] ?? buildingId
  );
}

const CATEGORY_OPTIONS = REPORT_CATEGORIES.map((c) => ({ value: c, label: c }));
const URGENCY_OPTIONS = [
  { value: "상", label: "상" },
  { value: "중", label: "중" },
  { value: "하", label: "하" },
];

interface InitialLocation {
  buildingId: BuildingId;
  floor: number;
  x: number;
  y: number;
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
  const [reporterName, setReporterName] = useState("재학생");

  const [pickingLocation, setPickingLocation] = useState(!initialLocation);
  const [photos, setPhotos] = useState<ReportPhoto[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [anonymous, setAnonymous] = useState(false);

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
      buildingName: initialLocation ? buildingLabel(initialLocation.buildingId) : "",
      floor: initialLocation?.floor ?? 0,
      pinX: initialLocation?.x ?? 0,
      pinY: initialLocation?.y ?? 0,
      category: "기타",
      urgency: "하",
      description: "",
      anonymous: false,
    },
  });

  const description = watch("description");
  const currentLocation = watch(["buildingId", "floor", "pinX", "pinY"]);
  const hasLocation = Boolean(currentLocation[0]);
  const category = watch("category");
  const urgency = watch("urgency");

  function handlePlacePin(buildingId: BuildingId, floor: number, x: number, y: number) {
    setValue("buildingId", buildingId);
    setValue("buildingName", buildingLabel(buildingId));
    setValue("floor", floor);
    setValue("pinX", x);
    setValue("pinY", y);
    setPickingLocation(false);
  }

  async function runAiAnalysis(currentDescription: string) {
    if (!currentDescription || currentDescription.length < 5) {
      toast.info("AI 분석을 위해 상세 설명을 5자 이상 입력해주세요.");
      return;
    }
    setAnalyzing(true);
    const result = await analyzeReport(currentDescription, photos.length);
    setValue("category", result.category);
    setValue("urgency", result.urgency);
    setAnalyzing(false);
    toast.success("AI 분석 결과를 반영했어요. 필요하면 직접 수정할 수 있어요.");
    return result.aiReason;
  }

  const [aiReason, setAiReason] = useState("");

  async function handlePhotosChange(next: ReportPhoto[]) {
    setPhotos(next);
    if (next.length > 0 && next.length > photos.length) {
      const reason = await runAiAnalysis(description);
      if (reason) setAiReason(reason);
    }
  }

  async function onSubmit(values: ReportCreateFormValues) {
    const report = await createReport.mutateAsync({
      ...values,
      anonymous,
      photos,
      reporterName: anonymous
        ? `익명-${Math.random().toString(36).slice(2, 6)}`
        : reporterName || "재학생",
      aiReason: aiReason || "설명 내용을 바탕으로 기본 분류를 적용했습니다.",
    });

    toast.success("신고가 접수되었습니다.");
    if (onSuccess) {
      onSuccess(report.id);
    } else {
      router.push(`/report/${report.id}`);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <Card>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-zinc-800">신고 위치</h2>
          <button
            type="button"
            className="text-primary-700 text-sm underline"
            onClick={() => setPickingLocation((v) => !v)}
          >
            {pickingLocation ? "닫기" : "위치 다시 선택"}
          </button>
        </div>
        {hasLocation && !pickingLocation ? (
          <p className="mt-2 text-zinc-600">
            {buildingLabel(currentLocation[0])} · {currentLocation[1]}F
          </p>
        ) : (
          <p className="mt-2 text-sm text-zinc-400">배치도를 눌러 신고할 위치를 찍어주세요.</p>
        )}
        {errors.buildingId && (
          <p className="mt-1 text-xs text-rose-500">{errors.buildingId.message}</p>
        )}
        {pickingLocation && (
          <div className="mt-4">
            <SiteMap mode="place" onPlacePin={handlePlacePin} />
          </div>
        )}
      </Card>

      <div>
        <p className="mb-2 text-sm text-zinc-500">사진 첨부 (선택)</p>
        <PhotoUploader photos={photos} onChange={handlePhotosChange} />
      </div>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-zinc-800">AI 분석 결과</h2>
          {analyzing && (
            <span className="flex items-center gap-1 text-xs text-zinc-400">
              <Spinner /> 분석 중...
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="mb-1 text-sm font-medium text-zinc-700">유형</p>
            <Dropdown
              value={category}
              options={CATEGORY_OPTIONS}
              onChange={(v) => setValue("category", v as ReportCreateFormValues["category"])}
            />
          </div>
          <div>
            <p className="mb-1 text-sm font-medium text-zinc-700">긴급도</p>
            <Dropdown
              value={urgency}
              options={URGENCY_OPTIONS}
              onChange={(v) => setValue("urgency", v as ReportCreateFormValues["urgency"])}
            />
          </div>
        </div>
        {aiReason && <p className="mt-2 text-xs text-zinc-400">AI 판단 근거: {aiReason}</p>}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="mt-3"
          disabled={analyzing}
          onClick={async () => {
            const reason = await runAiAnalysis(description);
            if (reason) setAiReason(reason);
          }}
        >
          AI 재분석
        </Button>
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

      <Card className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-zinc-800">익명으로 신고하기</p>
            <p className="text-xs text-zinc-400">켜면 신고자 정보 대신 익명 코드로 접수돼요.</p>
          </div>
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
            className="accent-primary-500 h-5 w-5"
          />
        </div>
        {!anonymous && (
          <label className="flex flex-col gap-1 text-sm text-zinc-600">
            <span className="font-medium text-zinc-700">신고자 이름</span>
            <input
              type="text"
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
              className="focus:border-primary-500 focus:ring-primary-200 rounded-lg border border-zinc-300 px-3 py-2 text-zinc-800 focus:ring-2 focus:outline-none"
              placeholder="이름을 입력해주세요"
            />
          </label>
        )}
      </Card>

      <Button type="submit" disabled={isSubmitting || createReport.isPending}>
        {isSubmitting || createReport.isPending ? "제출 중..." : "신고 제출하기"}
      </Button>
    </form>
  );
}
