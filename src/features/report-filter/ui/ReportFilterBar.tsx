"use client";

import { BUILDINGS } from "@/shared/config/site-map";
import { REPORT_CATEGORIES, type ReportFilter } from "@/shared/types/report";
import { Dropdown } from "@/shared/ui";

const SORT_OPTIONS = [
  { value: "urgency", label: "긴급도순" },
  { value: "latest", label: "최신순" },
  { value: "location", label: "위치순" },
];

const STATUS_OPTIONS = [
  { value: "", label: "전체 상태" },
  { value: "접수", label: "접수" },
  { value: "확인중", label: "확인중" },
  { value: "처리중", label: "처리중" },
  { value: "완료", label: "완료" },
  { value: "보류", label: "보류" },
];

const CATEGORY_OPTIONS = [
  { value: "", label: "전체 유형" },
  ...REPORT_CATEGORIES.map((c) => ({ value: c, label: c })),
];

const URGENCY_OPTIONS = [
  { value: "", label: "전체 긴급도" },
  { value: "상", label: "상" },
  { value: "중", label: "중" },
  { value: "하", label: "하" },
];

const BUILDING_OPTIONS = [
  { value: "", label: "전체 건물" },
  ...BUILDINGS.map((b) => ({ value: b.id, label: b.name })),
];

export function ReportFilterBar({
  filter,
  onChange,
}: {
  filter: ReportFilter;
  onChange: (filter: ReportFilter) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Dropdown
        ariaLabel="정렬"
        value={filter.sort ?? "urgency"}
        options={SORT_OPTIONS}
        onChange={(value) => onChange({ ...filter, sort: value as ReportFilter["sort"] })}
      />
      <Dropdown
        ariaLabel="상태"
        value={filter.status ?? ""}
        options={STATUS_OPTIONS}
        onChange={(value) =>
          onChange({ ...filter, status: (value || undefined) as ReportFilter["status"] })
        }
      />
      <Dropdown
        ariaLabel="유형"
        value={filter.category ?? ""}
        options={CATEGORY_OPTIONS}
        onChange={(value) =>
          onChange({ ...filter, category: (value || undefined) as ReportFilter["category"] })
        }
      />
      <Dropdown
        ariaLabel="긴급도"
        value={filter.urgency ?? ""}
        options={URGENCY_OPTIONS}
        onChange={(value) =>
          onChange({ ...filter, urgency: (value || undefined) as ReportFilter["urgency"] })
        }
      />
      <Dropdown
        ariaLabel="건물"
        value={filter.buildingId ?? ""}
        options={BUILDING_OPTIONS}
        onChange={(value) => onChange({ ...filter, buildingId: value || undefined })}
      />
    </div>
  );
}
