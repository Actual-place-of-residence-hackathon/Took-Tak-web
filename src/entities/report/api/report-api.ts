import type {
  CreateReportInput,
  Report,
  ReportActionEntry,
  ReportCategory,
  ReportFilter,
  ReportPhoto,
  ReportStatus,
  ReportStatusHistoryEntry,
  ReportUrgency,
} from "@/shared/types/report";
import { authenticatedFetch } from "@/shared/lib/backend-auth";

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await authenticatedFetch(url, options);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || response.statusText);
  }

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return response.json();
}

// ---------------------------------------------------------------------------
// 백엔드 wire 타입 (snake_case) — db/schema.sql, reportController.js 응답 그대로.
// ---------------------------------------------------------------------------

interface WireZone {
  id: string;
  name: string;
  pin_x: string | number | null;
  pin_y: string | number | null;
}

interface WirePhoto {
  id: string;
  url: string;
  kind: "report" | "action";
  sort_order: number;
}

interface WireAction {
  id: string;
  content: string;
  admin_id: string;
  created_at: string;
}

interface WireStatusHistoryEntry {
  from_status: ReportStatus | null;
  to_status: ReportStatus;
  reason: string | null;
  changed_at: string;
}

// GET /api/reports 목록 아이템 (평평한 구조, photos/actions/이력 없음)
interface WireReportListItem {
  id: string;
  type: ReportCategory | null;
  urgency: ReportUrgency | null;
  status: ReportStatus;
  part: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  group_id: string | null;
  building_id: string;
  building: string;
  floor_id: string;
  floor: string;
  zone_id: string | null;
  zone: string | null;
  pin_x: string | number | null;
  pin_y: string | number | null;
  reporter_id: string;
  reporter_name: string;
  thumbnail: string | null;
}

// GET /api/reports/:id 의 report 필드 (Sequelize include, 중첩 구조)
interface WireReportDetail {
  id: string;
  reporter_id: string;
  building_id: string;
  floor_id: string;
  zone_id: string | null;
  // 자유 클릭 신고는 zone 이 없고 이 좌표를 직접 씁니다.
  pin_x: string | number | null;
  pin_y: string | number | null;
  part: string | null;
  description: string | null;
  status: ReportStatus;
  type: ReportCategory | null;
  urgency: ReportUrgency | null;
  ai_type: ReportCategory | null;
  ai_urgency: ReportUrgency | null;
  ai_summary: string | null;
  ai_reasoning: string | null;
  ai_suggested_action: string | null;
  group_id: string | null;
  created_at: string;
  updated_at: string;
  building: { id: string; name: string };
  floor: { id: string; name: string };
  zone: WireZone | null;
  reporter: { id: string; name: string };
  photos: WirePhoto[];
  actions: WireAction[];
}

function toPinCoord(value: string | number | null): number | null {
  return value === null ? null : Number(value);
}

function mapPhoto(p: WirePhoto): ReportPhoto {
  return { id: p.id, url: p.url, kind: p.kind, sortOrder: p.sort_order };
}

function mapAction(a: WireAction): ReportActionEntry {
  return { id: a.id, content: a.content, adminId: a.admin_id, createdAt: a.created_at };
}

function mapStatusHistory(h: WireStatusHistoryEntry): ReportStatusHistoryEntry {
  return {
    fromStatus: h.from_status,
    toStatus: h.to_status,
    reason: h.reason,
    changedAt: h.changed_at,
  };
}

// 목록 화면(GET /api/reports)은 photos/actions/이력을 안 주므로 빈 값으로 채웁니다.
// 목록에서는 어차피 이 필드들을 쓰지 않고, 상세 진입 시 getReport() 로 다시 채웁니다.
function mapListItem(row: WireReportListItem): Report {
  return {
    id: row.id,
    buildingId: row.building_id,
    buildingName: row.building,
    floorId: row.floor_id,
    floorName: row.floor,
    zoneId: row.zone_id,
    zoneName: row.zone,
    pinX: toPinCoord(row.pin_x),
    pinY: toPinCoord(row.pin_y),
    part: row.part,
    description: row.description,
    status: row.status,
    category: row.type,
    urgency: row.urgency,
    aiCategory: row.type,
    aiUrgency: row.urgency,
    aiSummary: null,
    aiReason: null,
    aiSuggestedAction: null,
    photos: row.thumbnail
      ? [{ id: `${row.id}-thumb`, url: row.thumbnail, kind: "report", sortOrder: 0 }]
      : [],
    actions: [],
    statusHistory: [],
    reporterId: row.reporter_id,
    reporterName: row.reporter_name,
    groupId: row.group_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapDetail(detail: WireReportDetail, statusHistory: WireStatusHistoryEntry[]): Report {
  return {
    id: detail.id,
    buildingId: detail.building.id,
    buildingName: detail.building.name,
    floorId: detail.floor.id,
    floorName: detail.floor.name,
    zoneId: detail.zone?.id ?? null,
    zoneName: detail.zone?.name ?? null,
    // zone 이 있으면 zone 의 고정 좌표, 없으면(자유 클릭) 신고 자체의 좌표를 씁니다.
    pinX: toPinCoord(detail.zone?.pin_x ?? detail.pin_x),
    pinY: toPinCoord(detail.zone?.pin_y ?? detail.pin_y),
    part: detail.part,
    description: detail.description,
    status: detail.status,
    category: detail.type,
    urgency: detail.urgency,
    aiCategory: detail.ai_type,
    aiUrgency: detail.ai_urgency,
    aiSummary: detail.ai_summary,
    aiReason: detail.ai_reasoning,
    aiSuggestedAction: detail.ai_suggested_action,
    photos: detail.photos.map(mapPhoto),
    actions: detail.actions.map(mapAction),
    statusHistory: statusHistory.map(mapStatusHistory),
    reporterId: detail.reporter.id,
    reporterName: detail.reporter.name,
    groupId: detail.group_id,
    createdAt: detail.created_at,
    updatedAt: detail.updated_at,
  };
}

function toQueryString(filter: ReportFilter): string {
  const params = new URLSearchParams();

  if (filter.status) params.append("status", filter.status);
  if (filter.category) params.append("type", filter.category);
  if (filter.urgency) params.append("urgency", filter.urgency);
  if (filter.buildingId) params.append("building_id", filter.buildingId);
  if (filter.floorId) params.append("floor_id", filter.floorId);
  if (filter.zoneId) params.append("zone_id", filter.zoneId);
  if (filter.sort) params.append("sort", filter.sort);

  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function listReports(filter: ReportFilter = {}): Promise<Report[]> {
  const body = await request<{ reports: WireReportListItem[] }>(
    `/api/reports${toQueryString(filter)}`,
  );
  return body.reports.map(mapListItem);
}

export async function getReport(id: string): Promise<Report | undefined> {
  const body = await request<{ report: WireReportDetail; status_history: WireStatusHistoryEntry[] }>(
    `/api/reports/${id}`,
  );
  return mapDetail(body.report, body.status_history);
}

// 서버가 등록 직후 Bedrock 으로 분류를 생성하므로, 등록 응답은 reportId 뿐입니다.
// 완전한 Report(분류 결과 포함)를 돌려주기 위해 등록 후 상세를 한 번 더 조회합니다.
export async function createReport(input: CreateReportInput): Promise<Report> {
  const created = await request<{ reportId: string }>(`/api/reports`, {
    method: "POST",
    body: JSON.stringify({
      building_id: input.buildingId,
      floor_id: input.floorId,
      zone_id: input.zoneId ?? null,
      pin_x: input.pinX ?? null,
      pin_y: input.pinY ?? null,
      part: input.part,
      description: input.description,
      photoUrls: input.photoUrls ?? [],
    }),
  });

  const report = await getReport(created.reportId);
  if (!report) throw new Error("신고를 등록했지만 상세 조회에 실패했습니다.");
  return report;
}

// 신고 사진은 blob URL이 아니라 백엔드가 실제로 저장한 파일의 URL을 써야
// 새로고침/다른 화면/다른 기기에서도 보입니다. 신고 생성 전에 먼저 파일을
// 업로드하고, 그 응답 URL을 createReport 의 photoUrls 로 전달하세요.
export async function uploadReportImages(files: File[]): Promise<string[]> {
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));

  const body = await request<{ photoUrls: string[] }>(`/api/reports/upload-images`, {
    method: "POST",
    body: formData,
  });
  return body.photoUrls;
}

export async function updateReportStatus(
  id: string,
  status: ReportStatus,
  reason?: string,
): Promise<Report | undefined> {
  await request(`/api/reports/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, reason }),
  });
  return getReport(id);
}

export async function overrideClassification(
  id: string,
  category: ReportCategory,
  urgency: ReportUrgency,
): Promise<Report | undefined> {
  await request(`/api/reports/${id}/classification`, {
    method: "PATCH",
    body: JSON.stringify({ type: category, urgency }),
  });
  return getReport(id);
}

export async function submitAction(
  id: string,
  content: string,
  photoUrls: string[] = [],
): Promise<Report | undefined> {
  await request(`/api/reports/${id}/action`, {
    method: "POST",
    body: JSON.stringify({ content, photoUrls }),
  });
  return getReport(id);
}

export async function mergeReports(reportIds: string[], note?: string): Promise<void> {
  await request(`/api/reports/merge`, {
    method: "POST",
    body: JSON.stringify({ report_ids: reportIds, note }),
  });
}

// ※ 백엔드에 만족도(satisfaction) 저장 기능이 없습니다 (기획 범위 밖 —
//   report_actions/reports 어디에도 대응 컬럼이 없음). 프론트에서도 제거했습니다.
// export async function submitSatisfaction ... (삭제됨)
