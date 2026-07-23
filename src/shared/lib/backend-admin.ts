// 서버 전용(Route Handler에서만 import). 백엔드(Express, JWT)에 관리자로
// 로그인하기 위한 헬퍼입니다.
//
// 프론트의 관리자 게이트(ADMIN_PASSCODE + 쿠키, admin-auth.ts)와 백엔드의
// 관리자 인증(adminId + ADMIN_SIGNUP_CODE + JWT)은 완전히 별개의 시스템입니다.
// 프론트 패스코드는 "관리자 페이지 접근"만 막고, 실제 백엔드 API
// (상태변경/조치등록/병합/통계) 호출에는 백엔드가 발급한 JWT 가 반드시 필요합니다.
//
// 여기서는 고정된 관리자 계정 하나(BACKEND_ADMIN_ID)를 최초 접속 시
// 자동으로 등록(signup)하고, 이후에는 로그인만 해서 JWT 를 받아옵니다.

function getBackendUrl(): string {
  const url = process.env.BACKEND_INTERNAL_URL;
  if (!url) {
    throw new Error("BACKEND_INTERNAL_URL 이 설정되지 않았습니다. .env.local 을 확인하세요.");
  }
  return url;
}

function getAdminCredentials(): { adminId: string; signupCode: string } {
  const adminId = process.env.BACKEND_ADMIN_ID;
  const signupCode = process.env.BACKEND_ADMIN_SIGNUP_CODE;
  if (!adminId || !signupCode) {
    throw new Error(
      "BACKEND_ADMIN_ID / BACKEND_ADMIN_SIGNUP_CODE 가 설정되지 않았습니다. " +
        "백엔드의 ADMIN_SIGNUP_CODE 와 동일한 값을 .env.local 에 넣어야 합니다.",
    );
  }
  return { adminId, signupCode };
}

async function loginAsAdmin(adminId: string, signupCode: string): Promise<string | null> {
  const res = await fetch(`${getBackendUrl()}/api/auth/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ adminId, signupCode }),
  });

  if (!res.ok) return null;

  const body = (await res.json()) as { token: string };
  return body.token;
}

// 관리자 계정이 아직 백엔드에 없으면 만들고(신규 배포 최초 1회), JWT 를 반환합니다.
export async function issueBackendAdminToken(): Promise<string> {
  const { adminId, signupCode } = getAdminCredentials();

  const token = await loginAsAdmin(adminId, signupCode);
  if (token) return token;

  // 로그인 실패 = 계정이 아직 없을 가능성이 높으므로 등록을 시도합니다.
  // 이미 있는데 다른 이유(코드 불일치 등)로 실패했다면 아래 재로그인도 실패하고,
  // 그 에러 메시지가 호출자에게 그대로 전달됩니다.
  await fetch(`${getBackendUrl()}/api/auth/admin/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ adminId, signupCode, name: adminId }),
  });

  const retried = await loginAsAdmin(adminId, signupCode);
  if (!retried) {
    throw new Error(
      "백엔드 관리자 인증에 실패했습니다. BACKEND_ADMIN_SIGNUP_CODE 가 " +
        "백엔드의 ADMIN_SIGNUP_CODE 와 일치하는지 확인하세요.",
    );
  }
  return retried;
}
