"use client";

import { useRef, useState, DragEvent } from "react";
import { Camera, Upload, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface AvatarUploadProps {
  currentAvatar: string | null;
  userName: string;
  onUploaded: (url: string) => void;
}

export function AvatarUpload({ currentAvatar, userName, onUploaded }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentAvatar);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  async function uploadFile(file: File) {
    setError(null);
    setIsUploading(true);

    // Local preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/profile/avatar", { method: "POST", body: fd });
    const data = (await res.json()) as { avatar?: string; error?: string };
    setIsUploading(false);

    if (!res.ok || !data.avatar) {
      setError(data.error ?? "Upload failed.");
      return;
    }
    onUploaded(data.avatar);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar circle */}
      <div
        className={cn(
          "relative h-28 w-28 cursor-pointer overflow-hidden rounded-full border-2 transition",
          isDragging
            ? "border-dusk-lavender shadow-lg shadow-dusk-lavender/20"
            : "border-white/20 hover:border-dusk-lavender/60"
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        title="Click or drop image to upload"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Avatar"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-dusk-lavender/10 text-2xl font-bold text-dusk-lavender">
            {initials || <User className="h-10 w-10" />}
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 grid place-items-center bg-ink-950/60 opacity-0 transition hover:opacity-100">
          <Camera className="h-6 w-6 text-stone-100" />
        </div>

        {/* Loading spinner */}
        {isUploading && (
          <div className="absolute inset-0 grid place-items-center bg-ink-950/70">
            <svg
              className="h-8 w-8 animate-spin text-dusk-lavender"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />

      <button
        type="button"
        className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-stone-300 transition hover:border-dusk-lavender/50 hover:text-dusk-lavender"
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="h-3.5 w-3.5" />
        {preview ? "Change photo" : "Upload photo"}
      </button>

      {error && <p className="text-xs text-red-300">{error}</p>}
      <p className="text-center text-[11px] text-stone-600">
        JPG, PNG, WebP or GIF · Max 4 MB
      </p>
    </div>
  );
}
