"use client";

import { useRouter } from "next/navigation";

export function BackButton({ className = "" }: { className?: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      aria-label="뒤로 가기"
      className={`flex w-fit items-center gap-1 rounded-md px-2 py-1 text-sm text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 ${className}`}
    >
      ← 뒤로
    </button>
  );
}
