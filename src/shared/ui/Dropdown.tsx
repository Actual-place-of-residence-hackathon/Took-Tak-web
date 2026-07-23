"use client";

import { useEffect, useRef, useState } from "react";

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  ariaLabel?: string;
  className?: string;
}

export function Dropdown({ value, options, onChange, ariaLabel, className = "" }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const current = options.find((o) => o.value === value);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={() => setOpen((v) => !v)}
        className={`focus:border-primary-500 focus:ring-primary-200 flex w-full min-w-28 items-center justify-between gap-2 rounded-lg border bg-white px-3 py-2 text-sm text-zinc-800 transition-colors hover:border-zinc-400 focus:ring-2 focus:outline-none ${
          open ? "border-primary-500 ring-primary-200 ring-2" : "border-zinc-300"
        }`}
      >
        <span className="truncate">{current?.label ?? "선택"}</span>
        <span
          className={`shrink-0 text-xs text-zinc-400 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>

      {open && (
        <div className="animate-tt-slide-down absolute z-20 mt-1.5 w-max min-w-full overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg">
          <ul className="max-h-64 overflow-auto">
            {options.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`block w-full px-3 py-2 text-left text-sm transition-colors ${
                    option.value === value
                      ? "bg-primary-500 text-white"
                      : "text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
