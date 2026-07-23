import { Tabs } from "@/shared/ui";

interface BuildingOption {
  id: string;
  name: string;
}

export function BuildingTabs({
  buildings,
  value,
  onChange,
}: {
  buildings: BuildingOption[];
  value: string;
  onChange: (buildingId: string) => void;
}) {
  return (
    <Tabs
      value={value}
      onChange={onChange}
      options={buildings.map((b) => ({ value: b.id, label: b.name }))}
    />
  );
}
