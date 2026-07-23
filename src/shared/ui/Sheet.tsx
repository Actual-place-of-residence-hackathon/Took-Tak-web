"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Sheet({ open, onClose, title, children }: SheetProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="animate-tt-fade absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="animate-tt-slide-in-right relative flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-xl sm:w-[30rem] lg:w-[34rem]">
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-zinc-500 hover:bg-zinc-100"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 px-5 py-4">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
