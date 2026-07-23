"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import type { ReportPhoto } from "@/shared/types/report";

const MAX_PHOTOS = 3;

interface PhotoUploaderProps {
  photos: ReportPhoto[];
  onChange: (photos: ReportPhoto[]) => void;
}

function fileToPhoto(file: File, sortOrder: number): ReportPhoto {
  return {
    id: `${file.name}-${file.lastModified}-${Math.random()}`,
    url: URL.createObjectURL(file),
    kind: "report",
    sortOrder,
  };
}

export function PhotoUploader({ photos, onChange }: PhotoUploaderProps) {
  const disabled = photos.length >= MAX_PHOTOS;

  const addFiles = useCallback(
    (files: File[]) => {
      const remaining = MAX_PHOTOS - photos.length;
      if (remaining <= 0) return;
      const next = files.slice(0, remaining).map((f, i) => fileToPhoto(f, photos.length + i));
      onChange([...photos, ...next]);
    },
    [photos, onChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    maxFiles: MAX_PHOTOS,
    onDrop: addFiles,
    disabled,
    noClick: true,
    noKeyboard: true,
  });

  function removePhoto(id: string) {
    onChange(photos.filter((p) => p.id !== id));
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        {...getRootProps()}
        className={`flex flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 text-center text-sm transition-colors ${
          isDragActive ? "border-primary-500 bg-primary-50" : "border-zinc-300"
        } ${disabled ? "pointer-events-none opacity-50" : ""}`}
      >
        <input {...getInputProps()} />
        <span className="text-zinc-500">
          사진을 끌어놓으세요 (최대 {MAX_PHOTOS}장), 또는 아래 버튼으로 선택하세요
        </span>
        <div className="flex gap-2">
          <label className="bg-primary-500 hover:bg-primary-600 cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium text-white">
            앨범에서 선택
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={disabled}
              onChange={(e) => {
                if (e.target.files) addFiles(Array.from(e.target.files));
                e.target.value = "";
              }}
            />
          </label>
          <label className="bg-accent-300 hover:bg-accent-400 cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium text-zinc-800">
            카메라로 촬영
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              disabled={disabled}
              onChange={(e) => {
                if (e.target.files) addFiles(Array.from(e.target.files));
                e.target.value = "";
              }}
            />
          </label>
        </div>
      </div>

      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative aspect-square overflow-hidden rounded-lg border border-zinc-200"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt="첨부 사진" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(photo.id)}
                className="absolute top-1 right-1 rounded-full bg-black/60 px-1.5 py-0.5 text-xs text-white"
                aria-label="사진 삭제"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
