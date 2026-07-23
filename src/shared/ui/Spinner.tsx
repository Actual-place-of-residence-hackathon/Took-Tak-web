export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      className={`border-primary-500 inline-block h-4 w-4 animate-spin rounded-full border-2 border-t-transparent ${className}`}
      role="status"
      aria-label="로딩 중"
    />
  );
}
