import { Tabs } from "@/shared/ui";

export function FloorTabs({
  floors,
  value,
  onChange,
}: {
  floors: number[];
  value: number;
  onChange: (floor: number) => void;
}) {
  return (
    <Tabs
      value={String(value)}
      onChange={(v) => onChange(Number(v))}
      options={floors.map((f) => ({ value: String(f), label: `${f}F` }))}
    />
  );
}
