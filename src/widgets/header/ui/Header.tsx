"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/shared/ui";
import { clearAdminToken } from "@/shared/lib/backend-auth";

const studentLinks = [
  { href: "/", label: "배치도" },
  { href: "/reports", label: "신고 목록" },
];

const adminLinks = [
  { href: "/admin/dashboard", label: "관리자 대시보드" },
  { href: "/admin/reports", label: "신고 관리" },
  { href: "/admin/statistics", label: "통계" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isAdminArea = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const links = isAdminArea ? adminLinks : studentLinks;

  async function handleAdminLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    clearAdminToken();
    toast.success("관리자 세션을 종료했습니다.");
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="flex w-full items-center justify-between px-4 py-3">
        <Link
          href={isAdminArea ? "/admin/dashboard" : "/"}
          className="text-primary-700 text-lg font-bold"
        >
          Took-Tak
        </Link>

        <nav className="hidden items-center gap-4 sm:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-zinc-600 transition-colors hover:text-zinc-900"
            >
              {link.label}
            </Link>
          ))}
          {isAdminArea && (
            <Button variant="ghost" size="sm" onClick={handleAdminLogout}>
              관리자 로그아웃
            </Button>
          )}
        </nav>

        <button
          type="button"
          className="rounded-md p-2 text-zinc-600 sm:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="메뉴"
        >
          ☰
        </button>
      </div>

      {menuOpen && (
        <div className="animate-tt-fade-in flex flex-col gap-1 border-t border-zinc-200 px-4 py-3 sm:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-2 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {isAdminArea && (
            <button
              type="button"
              onClick={handleAdminLogout}
              className="rounded-md px-2 py-2 text-left text-sm text-zinc-600 hover:bg-zinc-50"
            >
              관리자 로그아웃
            </button>
          )}
        </div>
      )}
    </header>
  );
}
