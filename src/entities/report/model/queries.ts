"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateReportInput, Report, ReportFilter, ReportStatus } from "@/shared/types/report";
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
      category: Report["category"];
      urgency: Report["urgency"];
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
      actionNote,
      actionPhotos,
    }: {
      id: string;
      actionNote: string;
      actionPhotos: Report["actionPhotos"];
    }) => reportApi.submitAction(id, actionNote, actionPhotos),
    onSuccess: (report) => {
      invalidate();
      if (report) queryClient.invalidateQueries({ queryKey: reportKey(report.id) });
    },
  });
}

export function useSubmitSatisfaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, satisfied }: { id: string; satisfied: boolean }) =>
      reportApi.submitSatisfaction(id, satisfied),
    onSuccess: (report) => {
      if (report) queryClient.invalidateQueries({ queryKey: reportKey(report.id) });
    },
  });
}

export function useMergeReports() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateReports();
  return useMutation({
    mutationFn: ({ primaryId, mergeIds }: { primaryId: string; mergeIds: string[] }) =>
      reportApi.mergeReports(primaryId, mergeIds),
    onSuccess: (report) => {
      invalidate();
      if (report) queryClient.invalidateQueries({ queryKey: reportKey(report.id) });
    },
  });
}
