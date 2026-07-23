import { Tabs } from "@/shared/ui";

interface FloorOption {
  id: string;
  name: string;
}

export function FloorTabs({
  floors,
  value,
  onChange,
}: {
  floors: FloorOption[];
  value: string;
  onChange: (floorId: string) => void;
}) {
  return (
    <Tabs
      value={value}
      onChange={onChange}
      options={floors.map((f) => ({ value: f.id, label: f.name }))}
    />
  );
}
