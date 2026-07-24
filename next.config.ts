import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  // 브라우저는 백엔드 주소를 모르고 항상 상대경로 /api/* 로만 호출합니다
  // (shared/lib/backend-auth.ts). /api/admin/* 는 자체 Route Handler가
  // 있어 파일시스템 라우팅이 먼저 매치되므로 이 rewrite보다 우선합니다 —
  // 나머지 /api/* 만 여기서 백엔드(BACKEND_INTERNAL_URL, 같은 VPC 사설 IP)로
  // 프록시합니다.
  async rewrites() {
    const backendUrl = process.env.BACKEND_INTERNAL_URL;
    if (!backendUrl) return [];

    return {
      afterFiles: [
        {
          source: "/api/:path*",
          destination: `${backendUrl}/api/:path*`,
        },
      ],
      beforeFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
