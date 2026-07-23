"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/shared/ui";
import { setAdminToken } from "@/shared/lib/backend-auth";

export function AdminLoginPage() {
  const router = useRouter();
  const [passcode, setPasscode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode }),
    });
    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      toast.error(body?.message ?? "비밀번호가 올바르지 않습니다.");
      return;
    }

    // 페이지 접근 권한은 쿠키(서버가 세팅)가 담당하고, 실제 백엔드 API 호출에
    // 쓰는 JWT 는 이 응답 바디로 받아 브라우저에 저장합니다.
    const body = (await res.json()) as { backendToken: string };
    setAdminToken(body.backendToken);

    toast.success("관리자로 인증되었습니다.");
    router.replace("/admin/dashboard");
    router.refresh();
  }

  return (
    <main className="animate-tt-fade-in flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex flex-col gap-2">
        <h1 className="text-primary-800 text-2xl font-semibold">관리자 확인</h1>
        <p className="text-sm text-zinc-500">관리자 비밀번호를 입력해주세요.</p>
      </div>
      <form onSubmit={handleSubmit} className="flex w-full max-w-xs flex-col gap-3">
        <input
          type="password"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          placeholder="비밀번호"
          autoFocus
          className="focus:border-primary-500 focus:ring-primary-200 rounded-lg border border-zinc-300 px-3 py-2 text-center text-zinc-800 focus:ring-2 focus:outline-none"
        />
        <Button type="submit" disabled={submitting || !passcode}>
          {submitting ? "확인 중..." : "입장하기"}
        </Button>
      </form>
    </main>
  );
}
