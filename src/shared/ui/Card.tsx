import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-all duration-200 ${className}`}
      {...props}
    />
  );
}
