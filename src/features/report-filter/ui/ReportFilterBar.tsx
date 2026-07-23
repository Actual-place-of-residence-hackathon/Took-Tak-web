"use client";

import { useLocationTree } from "@/shared/lib/use-location-tree";
import {
  REPORT_CATEGORIES,
  REPORT_STATUS_LABELS,
  REPORT_URGENCY_LABELS,
  type ReportFilter,
} from "@/shared/types/report";
import { Dropdown } from "@/shared/ui";

const SORT_OPTIONS = [
  { value: "urgency", label: "긴급도순" },
  { value: "latest", label: "최신순" },
  { value: "location", label: "위치순" },
];

const STATUS_OPTIONS = [
  { value: "", label: "전체 상태" },
  ...(Object.entries(REPORT_STATUS_LABELS) as [string, string][]).map(([value, label]) => ({
    value,
    label,
  })),
];

const CATEGORY_OPTIONS = [
  { value: "", label: "전체 유형" },
  ...REPORT_CATEGORIES.map((c) => ({ value: c, label: c })),
];

const URGENCY_OPTIONS = [
  { value: "", label: "전체 긴급도" },
  ...(Object.entries(REPORT_URGENCY_LABELS) as [string, string][]).map(([value, label]) => ({
    value,
    label,
  })),
];

export function ReportFilterBar({
  filter,
  onChange,
}: {
  filter: ReportFilter;
  onChange: (filter: ReportFilter) => void;
}) {
  const { data: buildings = [] } = useLocationTree();
  const buildingOptions = [
    { value: "", label: "전체 건물" },
    ...buildings.map((b) => ({ value: b.id, label: b.name })),
  ];

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
        options={buildingOptions}
        onChange={(value) => onChange({ ...filter, buildingId: value || undefined })}
      />
    </div>
  );
}
