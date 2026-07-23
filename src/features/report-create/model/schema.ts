import { z } from "zod";

// category/urgency 는 여기 없습니다 — 서버(Bedrock)가 등록 직후 직접 생성하며,
// 익명 신고(anonymous)는 백엔드가 지원하지 않습니다(reports.reporter_id NOT NULL,
// 팀 결정 2026-07-24). part(부위)는 선택 입력입니다.
export const reportCreateSchema = z.object({
  buildingId: z.string().min(1, "위치를 선택해주세요."),
  floorId: z.string().min(1, "위치를 선택해주세요."),
  zoneId: z.string().min(1, "위치를 선택해주세요."),
  part: z.string().optional(),
  description: z
    .string()
    .min(5, "5자 이상 입력해주세요.")
    .max(500, "최대 500자까지 입력할 수 있어요."),
});

export type ReportCreateFormValues = z.infer<typeof reportCreateSchema>;
