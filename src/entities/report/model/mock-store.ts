import type { Report } from "@/shared/types/report";

function iso(daysAgo: number, hour = 9): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

const BUILDING_NAMES: Record<string, string> = {
  donghaeng: "동행관",
  geumbong: "금봉관",
  bongwan: "본관·실습동",
};

function seedReport(
  idNum: number,
  buildingId: string,
  floor: number,
  pinX: number,
  pinY: number,
  overrides: Partial<Report>,
): Report {
  const createdAt = overrides.createdAt ?? iso(idNum);
  const buildingName = BUILDING_NAMES[buildingId] ?? buildingId;
  return {
    id: `report-${idNum}`,
    buildingId,
    buildingName,
    floor,
    pinX,
    pinY,
    category: "기타",
    urgency: "중",
    description: "",
    photos: [],
    status: "접수",
    statusHistory: [{ status: "접수", changedAt: createdAt }],
    anonymous: false,
    reporterName: "익명",
    aiReason: "",
    createdAt,
    ...overrides,
  };
}

export const mockReports: Report[] = [
  seedReport(1, "donghaeng", 5, 15, 30, {
    category: "전기",
    urgency: "상",
    description: "501호 형광등이 깜빡거리다 완전히 꺼졌습니다.",
    status: "확인중",
    statusHistory: [
      { status: "접수", changedAt: iso(3) },
      { status: "확인중", changedAt: iso(2) },
    ],
    aiReason: "사진 속 조명기구와 '깜빡·꺼짐' 표현으로 전기 항목, 야간 안전 문제로 긴급도 상 판단",
  }),
  seedReport(2, "donghaeng", 5, 16, 32, {
    category: "전기",
    urgency: "중",
    description: "501호 콘센트 하나가 헐거워요.",
    status: "접수",
    aiReason: "전기 관련 키워드 감지, 즉각 위험도는 낮아 긴급도 중 판단",
  }),
  seedReport(3, "donghaeng", 5, 14, 29, {
    category: "안전/보안",
    urgency: "하",
    description: "501호 방문 잠금장치가 뻑뻑합니다.",
    status: "완료",
    statusHistory: [
      { status: "접수", changedAt: iso(10) },
      { status: "확인중", changedAt: iso(9) },
      { status: "처리중", changedAt: iso(8) },
      { status: "완료", changedAt: iso(7) },
    ],
    aiReason: "잠금장치 관련 키워드로 안전/보안 항목 분류",
    actionNote: "도어락 윤활 및 부품 교체 완료",
    satisfied: true,
  }),
  seedReport(4, "geumbong", 2, 40, 55, {
    category: "배관/누수",
    urgency: "상",
    description: "강당 천장에서 물이 뚝뚝 떨어집니다.",
    status: "처리중",
    statusHistory: [
      { status: "접수", changedAt: iso(1) },
      { status: "확인중", changedAt: iso(1) },
      { status: "처리중", changedAt: iso(0) },
    ],
    aiReason: "'물이 떨어짐' 표현으로 누수 판단, 확산 위험으로 긴급도 상",
  }),
  seedReport(5, "geumbong", 1, 30, 40, {
    category: "청소/위생",
    urgency: "중",
    description: "조리실 배수구에서 냄새가 심하게 납니다.",
    status: "접수",
    aiReason: "위생 관련 키워드 감지",
  }),
  seedReport(6, "bongwan", 4, 20, 35, {
    category: "냉난방",
    urgency: "중",
    description: "1학년 1반 에어컨이 찬바람이 안 나와요.",
    status: "확인중",
    statusHistory: [
      { status: "접수", changedAt: iso(2) },
      { status: "확인중", changedAt: iso(1) },
    ],
    aiReason: "냉난방 기기 고장 표현 감지",
  }),
  seedReport(7, "bongwan", 2, 25, 30, {
    category: "IT/네트워크",
    urgency: "하",
    description: "3학년 1반 와이파이가 자꾸 끊깁니다.",
    status: "보류",
    statusHistory: [
      { status: "접수", changedAt: iso(5) },
      { status: "보류", changedAt: iso(4), note: "네트워크팀 방문 일정 조율 중" },
    ],
    aiReason: "네트워크 관련 키워드 감지",
  }),
  seedReport(8, "donghaeng", 1, 70, 60, {
    category: "가구/집기",
    urgency: "하",
    description: "빅데이터분석실습실 의자 바퀴가 빠졌어요.",
    status: "완료",
    statusHistory: [
      { status: "접수", changedAt: iso(15) },
      { status: "처리중", changedAt: iso(13) },
      { status: "완료", changedAt: iso(12) },
    ],
    aiReason: "가구 파손 표현 감지",
    actionNote: "의자 교체 완료",
    satisfied: false,
  }),
  seedReport(9, "geumbong", 2, 45, 50, {
    category: "안전/보안",
    urgency: "상",
    description: "체육실 매트에 곰팡이가 피었습니다.",
    status: "확인중",
    aiReason: "위생·안전 복합 키워드 감지",
  }),
  seedReport(10, "bongwan", 1, 60, 65, {
    category: "IT/네트워크",
    urgency: "중",
    description: "서버실 냉방기가 소음이 심합니다.",
    status: "접수",
    aiReason: "기기 소음 표현 감지",
  }),
];

let nextId = mockReports.length + 1;
export function generateReportId(): string {
  const id = `report-${nextId}`;
  nextId += 1;
  return id;
}
