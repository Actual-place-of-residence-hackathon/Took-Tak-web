import { BUILDINGS, type BuildingId } from "@/shared/config/site-map";
import { Tabs } from "@/shared/ui";

export function BuildingTabs({
  value,
  onChange,
}: {
  value: BuildingId;
  onChange: (id: BuildingId) => void;
}) {
  return (
    <Tabs
      value={value}
      onChange={onChange}
      options={BUILDINGS.map((b) => ({ value: b.id, label: b.name }))}
    />
  );
}
