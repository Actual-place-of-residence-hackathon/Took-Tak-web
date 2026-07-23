"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="animate-tt-fade absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="animate-tt-scale-in relative flex max-h-[85vh] w-full max-w-lg flex-col rounded-xl bg-white shadow-xl">
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
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
