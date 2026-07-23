export type BuildingId = "donghaeng" | "geumbong" | "bongwan";

export interface Building {
  id: BuildingId;
  name: string;
  floors: number[];
}

export const BUILDINGS: Building[] = [
  { id: "donghaeng", name: "동행관", floors: [5, 4, 3, 2, 1] },
  { id: "geumbong", name: "금봉관", floors: [4, 3, 2, 1] },
  { id: "bongwan", name: "본관·실습동", floors: [4, 3, 2, 1] },
];

export function getBuilding(buildingId: string): Building | undefined {
  return BUILDINGS.find((b) => b.id === buildingId);
}

const FLOOR_PLAN_BASE_URL = "https://yeondon-s3.s3.us-east-1.amazonaws.com";

export function floorImageSrc(buildingId: string, floor: number): string {
  return `${FLOOR_PLAN_BASE_URL}/${buildingId}-${floor}.png`;
}
