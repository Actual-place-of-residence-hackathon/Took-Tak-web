"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateReportInput,
  ReportCategory,
  ReportFilter,
  ReportStatus,
  ReportUrgency,
} from "@/shared/types/report";
import * as reportApi from "@/entities/report/api/report-api";

const reportsKey = (filter: ReportFilter = {}) => ["reports", filter] as const;
const reportKey = (id: string) => ["report", id] as const;

export function useReports(filter: ReportFilter = {}) {
  return useQuery({
    queryKey: reportsKey(filter),
    queryFn: () => reportApi.listReports(filter),
  });
}

export function useReport(id: string) {
  return useQuery({
    queryKey: reportKey(id),
    queryFn: () => reportApi.getReport(id),
    enabled: Boolean(id),
  });
}

function useInvalidateReports() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["reports"] });
  };
}

export function useCreateReport() {
  const invalidate = useInvalidateReports();
  return useMutation({
    mutationFn: (input: CreateReportInput) => reportApi.createReport(input),
    onSuccess: invalidate,
  });
}

export function useUpdateReportStatus() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateReports();
  return useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: ReportStatus; note?: string }) =>
      reportApi.updateReportStatus(id, status, note),
    onSuccess: (report) => {
      invalidate();
      if (report) queryClient.invalidateQueries({ queryKey: reportKey(report.id) });
    },
  });
}

export function useOverrideClassification() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateReports();
  return useMutation({
    mutationFn: ({
      id,
      category,
      urgency,
    }: {
      id: string;
      category: ReportCategory;
      urgency: ReportUrgency;
    }) => reportApi.overrideClassification(id, category, urgency),
    onSuccess: (report) => {
      invalidate();
      if (report) queryClient.invalidateQueries({ queryKey: reportKey(report.id) });
    },
  });
}

export function useSubmitAction() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateReports();
  return useMutation({
    mutationFn: ({
      id,
      content,
      photoUrls,
    }: {
      id: string;
      content: string;
      photoUrls?: string[];
    }) => reportApi.submitAction(id, content, photoUrls),
    onSuccess: (report) => {
      invalidate();
      if (report) queryClient.invalidateQueries({ queryKey: reportKey(report.id) });
    },
  });
}

// ※ 만족도(satisfaction) 기능은 백엔드에 대응 엔드포인트가 없어 제거했습니다.
// export function useSubmitSatisfaction ... (삭제됨)

export function useMergeReports() {
  const invalidate = useInvalidateReports();
  return useMutation({
    mutationFn: ({ reportIds, note }: { reportIds: string[]; note?: string }) =>
      reportApi.mergeReports(reportIds, note),
    onSuccess: invalidate,
  });
}
