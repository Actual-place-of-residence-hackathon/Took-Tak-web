import { z } from "zod";
import { REPORT_CATEGORIES } from "@/shared/types/report";

export const reportCreateSchema = z.object({
  buildingId: z.string().min(1, "위치를 선택해주세요."),
  buildingName: z.string(),
  floor: z.number(),
  pinX: z.number(),
  pinY: z.number(),
  category: z.enum(REPORT_CATEGORIES),
  urgency: z.enum(["상", "중", "하"]),
  description: z
    .string()
    .min(5, "5자 이상 입력해주세요.")
    .max(500, "최대 500자까지 입력할 수 있어요."),
  anonymous: z.boolean(),
});

export type ReportCreateFormValues = z.infer<typeof reportCreateSchema>;

export { REPORT_CATEGORIES };
