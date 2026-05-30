"use client";

import { useState, useRef, useCallback } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { ImagePlus, X, Loader2 } from "lucide-react";

interface PhotoUploadProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  multiple?: boolean;
}

export function PhotoUpload({ photos, onChange, multiple = true }: PhotoUploadProps) {
  const { t } = useLanguage();
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFiles(files: FileList | File[]) {
    const arr = Array.from(files);
    if (!arr.length) return;
    setUploading(true);
    const newUrls: string[] = [];
    for (const file of arr) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) {
        const { url } = await res.json();
        newUrls.push(url);
      }
    }
    onChange(multiple ? [...photos, ...newUrls] : newUrls.slice(-1));
    setUploading(false);
  }

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length) uploadFiles(files);
  }, [photos, multiple]); // eslint-disable-line react-hooks/exhaustive-deps

  function removePhoto(index: number) {
    onChange(photos.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      {/* Thumbnails */}
      {photos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {photos.map((url, i) => (
            <div key={i} className="relative w-20 h-20 group">
              <img
                src={url}
                alt=""
                className="w-20 h-20 rounded-xl object-cover border"
                style={{ borderColor: "var(--card-border)" }}
              />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="absolute -top-1.5 -end-1.5 w-5 h-5 rounded-full bg-coral text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                aria-label="Remove photo"
              >
                <X size={11} strokeWidth={3} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => !uploading && inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && !uploading && inputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-150 py-7 select-none"
        style={{
          borderColor: isDragging ? "var(--color-ocean-teal)" : "var(--card-border)",
          backgroundColor: isDragging
            ? "color-mix(in srgb, var(--color-ocean-teal) 8%, transparent)"
            : "var(--surface-alt)",
        }}
      >
        {uploading ? (
          <>
            <Loader2 size={22} className="animate-spin" style={{ color: "var(--color-ocean-teal)" }} />
            <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              {t("form.photos.upload")}…
            </p>
          </>
        ) : (
          <>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "color-mix(in srgb, var(--color-ocean-teal) 15%, transparent)" }}
            >
              <ImagePlus size={20} style={{ color: "var(--color-ocean-teal)" }} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
                {t("form.photos.upload")}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                {isDragging ? "Drop to upload" : "or drag & drop"}
              </p>
            </div>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={(e) => uploadFiles(e.target.files!)}
        className="hidden"
        disabled={uploading}
      />
    </div>
  );
}
