// 백엔드(Took-Tak-back, db/schema.sql)와 1:1로 맞춘 타입입니다.
// 값(enum 리터럴)은 백엔드 것을 그대로 씁니다 — 한글 라벨이 필요한 곳은
// 아래 REPORT_STATUS_LABELS / REPORT_URGENCY_LABELS 로 표시만 변환하고,
// 상태 비교·API 전송에는 항상 이 영문 값을 씁니다.

export type ReportStatus = "received" | "checking" | "processing" | "done" | "hold";

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  received: "접수",
  checking: "확인중",
  processing: "처리중",
  done: "완료",
  hold: "보류",
};

export type ReportUrgency = "high" | "medium" | "low";

export const REPORT_URGENCY_LABELS: Record<ReportUrgency, string> = {
  high: "상",
  medium: "중",
  low: "하",
};

// 팀 결정(2026-07-24): 신고 유형 목록은 백엔드/Bedrock 쪽(aiService.js
// PLACEHOLDER_TYPES)을 정본으로 채택합니다. 유형이 확정되면 이 배열과
// 백엔드 PLACEHOLDER_TYPES 를 함께 교체하세요.
export const REPORT_CATEGORIES = ["전기", "누수", "파손", "청소", "기타"] as const;

export type ReportCategory = (typeof REPORT_CATEGORIES)[number];

export interface ReportPhoto {
  id: string;
  url: string;
  kind: "report" | "action";
  sortOrder: number;
}

export interface ReportStatusHistoryEntry {
  fromStatus: ReportStatus | null;
  toStatus: ReportStatus;
  reason: string | null;
  changedAt: string;
}

export interface ReportActionEntry {
  id: string;
  content: string;
  adminId: string;
  createdAt: string;
}

// 위치는 건물→층→구역(zone) 계층입니다. zone 은 관리자가 미리 등록해둔
// 유한한 목록이며, pinX/pinY 는 그 zone 이 배치도 이미지 위 어디에 있는지
// 나타내는 고정 좌표(0~100 퍼센트)입니다 — 학생이 임의 좌표를 찍지 않습니다.
export interface Report {
  id: string;
  buildingId: string;
  buildingName: string;
  floorId: string;
  floorName: string;
  zoneId: string | null;
  zoneName: string | null;
  pinX: number | null;
  pinY: number | null;
  part: string | null;
  description: string | null;
  status: ReportStatus;
  // 최종 분류(관리자가 재분류하면 바뀜)
  category: ReportCategory | null;
  urgency: ReportUrgency | null;
  // AI 원본 분류(재분류해도 보존됨 — 정확도 추적용)
  aiCategory: ReportCategory | null;
  aiUrgency: ReportUrgency | null;
  aiSummary: string | null;
  aiReason: string | null;
  aiSuggestedAction: string | null;
  photos: ReportPhoto[];
  actions: ReportActionEntry[];
  statusHistory: ReportStatusHistoryEntry[];
  reporterId: string;
  reporterName: string;
  groupId: string | null;
  createdAt: string;
  updatedAt: string;
}

// 신고 등록 시 보내는 값. category/aiReason 은 여기 없습니다 — 서버(Bedrock)가
// 등록 직후 직접 생성합니다. urgency 는 학생이 직접 선택해서 보냅니다.
export interface CreateReportInput {
  buildingId: string;
  floorId: string;
  // zoneId 는 관리자가 등록해둔 고정 구역을 선택했을 때만 있습니다.
  // 자유 클릭으로 신고한 경우 zoneId 는 없고 pinX/pinY 만 있습니다.
  zoneId?: string;
  pinX?: number;
  pinY?: number;
  part?: string;
  urgency: ReportUrgency;
  description: string;
  photoUrls?: string[];
}

export interface ReportFilter {
  status?: ReportStatus;
  category?: ReportCategory;
  urgency?: ReportUrgency;
  buildingId?: string;
  floorId?: string;
  zoneId?: string;
  sort?: "urgency" | "latest" | "location";
}
