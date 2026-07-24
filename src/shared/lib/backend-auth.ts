// 백엔드(Express, JWT) 인증 토큰 관리.
//
// 백엔드는 팀 결정(2026-07-23)에 따라 비밀번호 인증이 없습니다.
// POST /api/auth/login 은 studentId 하나만으로 학생을 식별/자동생성하고
// JWT 를 내어주도록 설계돼 있습니다 — reports.reporter_id 가 NOT NULL 이라
// "누가 신고했는지" 식별자가 반드시 있어야 하기 때문입니다.
//
// 이 프로젝트는 아직 실제 학생 로그인 UI가 없으므로, 브라우저에 저장한
// 디바이스 식별자를 studentId 로 사용해 자동 로그인합니다. 실제 DataGSM 연동이
// 붙으면 getOrCreateDeviceId() 자리만 실제 학번으로 교체하면 됩니다.

const DEVICE_ID_KEY = "tt_device_id";
const STUDENT_TOKEN_KEY = "tt_student_token";
const ADMIN_TOKEN_KEY = "tt_admin_token";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

// crypto.randomUUID()는 secure context(HTTPS/localhost)에서만 쓸 수 있습니다.
// 배포 서버가 아직 HTTP라서 그냥 쓰면 여기서 예외가 나 로그인 자체가
// 시도되지 않습니다(네트워크 탭에 요청조차 안 찍히는 원인) — 대체 구현 사용.
function generateDeviceId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getOrCreateDeviceId(): string {
  const existing = window.localStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;

  const id = generateDeviceId();
  window.localStorage.setItem(DEVICE_ID_KEY, id);
  return id;
}

// 페이지 진입 직후 여러 컴포넌트가 동시에 getAuthToken()을 호출하면
// 캐시된 토큰이 없는 상태에서 /api/auth/login 이 중복으로 나갑니다.
// 같은 studentId로 거의 동시에 두 번 요청하면 백엔드가 유저를 두 번
// 생성하려다 두 번째 요청에서 409(이미 있음)를 내는 경쟁 상태가 생기므로,
// 진행 중인 발급 요청을 하나로 묶어(in-flight promise 공유) 재사용합니다.
let inFlightTokenRequest: Promise<string> | null = null;

async function issueStudentToken(): Promise<string> {
  if (inFlightTokenRequest) return inFlightTokenRequest;

  inFlightTokenRequest = (async () => {
    const deviceId = getOrCreateDeviceId();

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: deviceId }),
    });

    if (!res.ok) {
      throw new Error("학생 인증 토큰 발급에 실패했습니다.");
    }

    const body = (await res.json()) as { token: string };
    window.localStorage.setItem(STUDENT_TOKEN_KEY, body.token);
    return body.token;
  })();

  try {
    return await inFlightTokenRequest;
  } finally {
    inFlightTokenRequest = null;
  }
}

export function getAdminToken(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string): void {
  window.localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export function clearStudentToken(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(STUDENT_TOKEN_KEY);
}

// 관리자 토큰이 있으면 그걸 우선 사용하고, 없으면 학생 토큰을 자동 발급합니다.
// (관리자 페이지는 /admin/login 을 통과해야만 관리자 토큰이 생기므로,
//  일반 사용자는 항상 학생 토큰 경로를 탑니다.)
export async function getAuthToken(): Promise<string> {
  if (!isBrowser()) {
    throw new Error("getAuthToken 은 브라우저에서만 호출할 수 있습니다.");
  }

  const adminToken = getAdminToken();
  if (adminToken) return adminToken;

  const cachedStudentToken = window.localStorage.getItem(STUDENT_TOKEN_KEY);
  if (cachedStudentToken) return cachedStudentToken;

  return issueStudentToken();
}

// 401 응답을 받았을 때 캐시된 토큰을 지우고 한 번 더 새로 발급받기 위한 헬퍼.
// 관리자 토큰은 여기서 지우지 않습니다 — 관리자 세션 만료는 재로그인으로
// 처리해야지, 조용히 학생 토큰으로 강등시키면 안 됩니다.
export function invalidateStudentToken(): void {
  clearStudentToken();
}

const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};

// 백엔드 /api/* 는 예외(/api/auth/*) 없이 전부 Authorization: Bearer <JWT> 를
// 요구합니다(requireAuth 미들웨어). 백엔드를 호출하는 모든 클라이언트 코드는
// 반드시 이 함수를 거쳐야 합니다 — 그냥 fetch() 를 쓰면 토큰이 안 붙어 401 이 납니다.
export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  async function attempt(): Promise<Response> {
    const token = await getAuthToken();
    // FormData(멀티파트 업로드) 요청은 Content-Type을 강제로 붙이면 안 됩니다 —
    // 브라우저가 파일 경계(boundary)까지 포함해 직접 설정해야 하는데, 여기서
    // "application/json"으로 덮어쓰면 백엔드(multer)가 파싱하지 못합니다.
    const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
    return fetch(url, {
      credentials: "same-origin",
      ...options,
      headers: {
        ...(isFormData ? {} : DEFAULT_HEADERS),
        ...(options.headers ?? {}),
        Authorization: `Bearer ${token}`,
      },
    });
  }

  let response = await attempt();

  // 학생 토큰이 만료/무효화됐을 수 있으니 한 번만 재발급 후 재시도합니다.
  // 관리자 토큰은 재시도하지 않습니다 — 조용히 재발급되면 관리자 세션 만료를
  // 사용자가 알아채지 못한 채 다른 계정으로 동작할 위험이 있습니다.
  if (response.status === 401 && !getAdminToken()) {
    invalidateStudentToken();
    response = await attempt();
  }

  return response;
}
