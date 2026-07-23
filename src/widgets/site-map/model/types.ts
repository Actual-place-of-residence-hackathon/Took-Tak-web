export type SiteMapMode = "browse" | "urgency" | "place";

export interface SiteMapZone {
  id: string;
  name: string;
  pinX: number | null;
  pinY: number | null;
}
