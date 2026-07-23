import type { ReportCategory, ReportUrgency } from "@/shared/types/report";

const KEYWORD_RULES: { keywords: string[]; category: ReportCategory }[] = [
  { keywords: ["콘센트", "전등", "형광등", "조명", "전기", "누전", "깜빡"], category: "전기" },
  { keywords: ["에어컨", "히터", "난방", "냉방", "온도"], category: "냉난방" },
  { keywords: ["누수", "물이", "배수", "변기", "수도"], category: "배관/누수" },
  { keywords: ["책상", "의자", "사물함", "문", "잠금"], category: "가구/집기" },
  { keywords: ["와이파이", "네트워크", "인터넷", "컴퓨터", "서버"], category: "IT/네트워크" },
  { keywords: ["냄새", "곰팡이", "쓰레기", "청소", "위생"], category: "청소/위생" },
  { keywords: ["위험", "화재", "파손", "깨짐", "안전"], category: "안전/보안" },
];

const URGENT_KEYWORDS = ["위험", "화재", "누수", "물이", "완전히", "심각", "다침"];

function delay<T>(value: T, ms = 800): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export interface AiAnalysisResult {
  category: ReportCategory;
  urgency: ReportUrgency;
  aiReason: string;
}

export async function analyzeReport(
  description: string,
  photoCount: number,
): Promise<AiAnalysisResult> {
  const text = description.toLowerCase();
  const matched = KEYWORD_RULES.find((rule) => rule.keywords.some((k) => text.includes(k)));
  const category: ReportCategory = matched?.category ?? "기타";

  const isUrgent = URGENT_KEYWORDS.some((k) => text.includes(k));
  const urgency: ReportUrgency = isUrgent ? "상" : photoCount > 0 ? "중" : "하";

  const aiReason = matched
    ? `설명에서 '${matched.keywords.find((k) => text.includes(k))}' 키워드를 감지해 ${category} 항목으로 분류했습니다.${
        isUrgent ? " 위험 표현이 포함되어 긴급도를 상으로 판단했습니다." : ""
      }`
    : "구체적인 유형 키워드를 찾지 못해 기타 항목으로 분류했습니다. 필요시 직접 수정해주세요.";

  return delay({ category, urgency, aiReason });
}
