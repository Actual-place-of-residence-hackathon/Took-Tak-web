// 배치도 건물/층/구역 목록. 백엔드 GET /api/locations/tree 에서 가져옵니다.
// (기존에는 여기 하드코딩돼 있었지만, 백엔드 zones 테이블이 정본이 된 이후
//  화면과 실제 등록 가능한 위치가 어긋날 수 있어 API 조회로 바꿨습니다.)

import { authenticatedFetch } from "@/shared/lib/backend-auth";

export interface Zone {
  id: string;
  name: string;
  pinX: number | null;
  pinY: number | null;
}

export interface Floor {
  id: string;
  name: string;
  zones: Zone[];
}

export interface Building {
  id: string;
  name: string;
  floors: Floor[];
}

// 배치도 이미지는 S3(yeondon-s3)에 슬러그-층번호 이름으로 올라가 있습니다
// (donghaeng-1.png 등, 프론트 번들에는 더 이상 포함하지 않습니다).
// DB의 buildings.name(한글)과 그 슬러그를 여기서 연결합니다. 새 건물을
// 등록하면 S3 파일과 함께 이 매핑도 추가해야 합니다.
const FLOOR_PLAN_BASE_URL = "https://yeondon-s3.s3.us-east-1.amazonaws.com";

const BUILDING_IMAGE_SLUGS: Record<string, string> = {
  동행관: "donghaeng",
  금봉관: "geumbong",
  "본관·실습동": "bongwan",
};

export function floorImageSrc(buildingName: string, floorName: string): string {
  const slug = BUILDING_IMAGE_SLUGS[buildingName];
  const floorNumber = floorName.replace(/[^0-9]/g, "");
  if (!slug || !floorNumber) return `${FLOOR_PLAN_BASE_URL}/unknown.png`;
  return `${FLOOR_PLAN_BASE_URL}/${slug}-${floorNumber}.png`;
}

interface LocationTreeResponse {
  buildings: {
    id: string;
    name: string;
    floors: {
      id: string;
      name: string;
      zones: { id: string; name: string; pin_x: string | number | null; pin_y: string | number | null }[];
    }[];
  }[];
}

export async function fetchLocationTree(): Promise<Building[]> {
  const res = await authenticatedFetch("/api/locations/tree");
  if (!res.ok) {
    throw new Error("배치도 위치 정보를 불러오지 못했습니다.");
  }
  const body = (await res.json()) as LocationTreeResponse;

  return body.buildings.map((b) => ({
    id: b.id,
    name: b.name,
    floors: b.floors.map((f) => ({
      id: f.id,
      name: f.name,
      zones: f.zones.map((z) => ({
        id: z.id,
        name: z.name,
        pinX: z.pin_x === null ? null : Number(z.pin_x),
        pinY: z.pin_y === null ? null : Number(z.pin_y),
      })),
    })),
  }));
}
