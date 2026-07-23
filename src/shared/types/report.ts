export type ReportStatus = "접수" | "확인중" | "처리중" | "완료" | "보류";

export type ReportUrgency = "상" | "중" | "하";

export const REPORT_CATEGORIES = [
  "전기",
  "냉난방",
  "배관/누수",
  "가구/집기",
  "IT/네트워크",
  "청소/위생",
  "안전/보안",
  "기타",
] as const;

export type ReportCategory = (typeof REPORT_CATEGORIES)[number];

export interface ReportStatusHistoryEntry {
  status: ReportStatus;
  changedAt: string;
  note?: string;
}

export interface ReportPhoto {
  id: string;
  url: string;
  name: string;
}

export interface Report {
  id: string;
  buildingId: string;
  buildingName: string;
  floor: number;
  pinX: number;
  pinY: number;
  locationLabel?: string;
  category: ReportCategory;
  urgency: ReportUrgency;
  description: string;
  photos: ReportPhoto[];
  status: ReportStatus;
  statusHistory: ReportStatusHistoryEntry[];
  anonymous: boolean;
  reporterName: string;
  aiReason: string;
  actionNote?: string;
  actionPhotos?: ReportPhoto[];
  satisfied?: boolean;
  createdAt: string;
}

export interface CreateReportInput {
  buildingId: string;
  buildingName: string;
  floor: number;
  pinX: number;
  pinY: number;
  locationLabel?: string;
  category: ReportCategory;
  urgency: ReportUrgency;
  description: string;
  photos: ReportPhoto[];
  anonymous: boolean;
  reporterName: string;
  aiReason: string;
}

export interface ReportFilter {
  status?: ReportStatus;
  category?: ReportCategory;
  urgency?: ReportUrgency;
  buildingId?: string;
  floor?: number;
  sort?: "urgency" | "latest" | "location";
}
