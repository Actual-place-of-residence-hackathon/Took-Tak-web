/**
 * 관리자 전용 레이아웃. role !== "admin"이면 리다이렉트하는 가드를
 * middleware.ts 또는 여기서 Supabase 세션 체크로 구현합니다.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-1 flex-col">{children}</div>;
}
