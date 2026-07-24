import { z } from "zod";

// category/urgency 는 여기 없습니다 — 서버(Bedrock)가 등록 직후 직접 생성하며,
// 익명 신고(anonymous)는 백엔드가 지원하지 않습니다(reports.reporter_id NOT NULL,
// 팀 결정 2026-07-24). part(부위)는 선택 입력입니다.
// 위치는 zoneId(등록된 구역 선택) 또는 pinX/pinY(자유 클릭) 중 하나만 있으면 됩니다.
export const reportCreateSchema = z
  .object({
    buildingId: z.string().min(1, "위치를 선택해주세요."),
    floorId: z.string().min(1, "위치를 선택해주세요."),
    zoneId: z.string().optional(),
    pinX: z.number().min(0).max(100).optional(),
    pinY: z.number().min(0).max(100).optional(),
    part: z.string().optional(),
    description: z
      .string()
      .min(5, "5자 이상 입력해주세요.")
      .max(500, "최대 500자까지 입력할 수 있어요."),
  })
  .refine((values) => Boolean(values.zoneId) || (values.pinX !== undefined && values.pinY !== undefined), {
    message: "배치도에서 신고 위치를 선택해주세요.",
    path: ["zoneId"],
  });

export type ReportCreateFormValues = z.infer<typeof reportCreateSchema>;
