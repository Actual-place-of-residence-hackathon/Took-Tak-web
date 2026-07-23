import type { CreateReportInput, Report, ReportFilter, ReportStatus } from "@/shared/types/report";

const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    credentials: "same-origin",
    headers: {
      ...DEFAULT_HEADERS,
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || response.statusText);
  }

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return response.json();
}

function toQueryString(filter: ReportFilter): string {
  const params = new URLSearchParams();

  if (filter.status) params.append("status", filter.status);
  if (filter.category) params.append("category", filter.category);
  if (filter.urgency) params.append("urgency", filter.urgency);
  if (filter.buildingId) params.append("buildingId", filter.buildingId);
  if (filter.floor !== undefined) params.append("floor", String(filter.floor));
  if (filter.sort) params.append("sort", filter.sort);

  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function listReports(filter: ReportFilter = {}): Promise<Report[]> {
  return request<Report[]>(`/api/reports${toQueryString(filter)}`);
}

export async function getReport(id: string): Promise<Report | undefined> {
  return request<Report>(`/api/reports/${id}`);
}

export async function createReport(input: CreateReportInput): Promise<Report> {
  return request<Report>(`/api/reports`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateReportStatus(
  id: string,
  status: ReportStatus,
  note?: string,
): Promise<Report | undefined> {
  return request<Report>(`/api/reports/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, note }),
  });
}

export async function overrideClassification(
  id: string,
  category: Report["category"],
  urgency: Report["urgency"],
): Promise<Report | undefined> {
  return request<Report>(`/api/reports/${id}/classification`, {
    method: "PATCH",
    body: JSON.stringify({ category, urgency }),
  });
}

export async function submitAction(
  id: string,
  actionNote: string,
  actionPhotos: Report["actionPhotos"],
): Promise<Report | undefined> {
  return request<Report>(`/api/reports/${id}/action`, {
    method: "POST",
    body: JSON.stringify({ actionNote, actionPhotos }),
  });
}

export async function submitSatisfaction(
  id: string,
  satisfied: boolean,
): Promise<Report | undefined> {
  return request<Report>(`/api/reports/${id}/satisfaction`, {
    method: "POST",
    body: JSON.stringify({ satisfied }),
  });
}

export async function mergeReports(
  primaryId: string,
  mergeIds: string[],
): Promise<Report | undefined> {
  return request<Report>(`/api/reports/${primaryId}/merge`, {
    method: "POST",
    body: JSON.stringify({ mergeIds }),
  });
}
