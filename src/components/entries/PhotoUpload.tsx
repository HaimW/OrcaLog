"use client";

import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";

interface PhotoUploadProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  multiple?: boolean;
}

export function PhotoUpload({ photos, onChange, multiple = true }: PhotoUploadProps) {
  const { t } = useLanguage();
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
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

  function removePhoto(index: number) {
    onChange(photos.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {photos.map((url, i) => (
          <div key={i} className="relative w-24 h-24">
            <img src={url} alt="" className="w-24 h-24 rounded-lg object-cover" />
            <button
              type="button"
              onClick={() => removePhoto(i)}
              className="absolute top-1 right-1 bg-coral text-white w-6 h-6 rounded-full text-xs"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <label className="btn btn-secondary text-sm inline-block cursor-pointer">
        {uploading ? "..." : t("form.photos.upload")}
        <input
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          disabled={uploading}
        />
      </label>
      {photos.length === 0 && !uploading && (
        <p className="text-sm text-gray-500">{t("form.photos.empty")}</p>
      )}
    </div>
  );
}
