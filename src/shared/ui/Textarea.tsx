import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  maxLength?: number;
}

export function Textarea({ label, maxLength, className = "", value, id, ...props }: TextareaProps) {
  const length = typeof value === "string" ? value.length : 0;
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-zinc-700">
          {label}
        </label>
      )}
      <textarea
        id={id}
        value={value}
        maxLength={maxLength}
        className={`focus:border-primary-500 focus:ring-primary-200 min-h-32 resize-none rounded-lg border border-zinc-300 px-3 py-2 text-zinc-800 focus:ring-2 focus:outline-none ${className}`}
        {...props}
      />
      {maxLength && (
        <span className="self-end text-xs text-zinc-400">
          {length} / {maxLength}
        </span>
      )}
    </div>
  );
}
