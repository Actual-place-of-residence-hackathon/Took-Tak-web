import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_COOKIE_NAME,
  createAdminSessionToken,
  verifyPasscode,
} from "@/shared/lib/admin-auth";
import { issueBackendAdminToken } from "@/shared/lib/backend-admin";

export async function POST(request: Request) {
  const { passcode } = (await request.json()) as { passcode?: string };

  if (!passcode || !verifyPasscode(passcode)) {
    return NextResponse.json({ message: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  // 프론트 패스코드 게이트는 통과했지만, 실제 백엔드 API(상태변경/조치등록/
  // 통계 등)를 호출하려면 백엔드가 발급한 JWT 가 별도로 필요합니다.
  // 여기서 실패하면 쿠키를 세팅하지 않고 바로 에러를 반환합니다 — 조용히
  // 넘어가면 이후 모든 관리자 API 호출이 401 로 실패하는데 원인을 알기 어렵습니다.
  let backendToken: string;
  try {
    backendToken = await issueBackendAdminToken();
  } catch (error) {
    const message = error instanceof Error ? error.message : "백엔드 인증에 실패했습니다.";
    return NextResponse.json({ message }, { status: 502 });
  }

  // Secure 쿠키는 HTTPS에서만 브라우저가 저장합니다. NODE_ENV==="production"으로
  // 판단하면 배포 서버가 아직 HTTP인 지금 브라우저가 쿠키를 조용히 버려서
  // 로그인은 성공해도 /admin/dashboard 진입 시 다시 로그인 화면으로 튕깁니다.
  // 실제 요청 프로토콜을 보고 판단합니다(TLS 붙이면 자동으로 secure=true 전환).
  const isHttps =
    request.headers.get("x-forwarded-proto") === "https" || new URL(request.url).protocol === "https:";

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, createAdminSessionToken(), {
    httpOnly: true,
    secure: isHttps,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({ ok: true, backendToken });
}
