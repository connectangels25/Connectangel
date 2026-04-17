import { useRef, useState } from "react";
import { Upload, X, Edit2 } from "lucide-react";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useAuth } from "@/context/AuthContext";

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  hint?: string;
  required?: boolean;
  error?: string;
}

export default function ImageUploadField({ label, value, onChange, folder = "general", hint, required, error }: ImageUploadFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const { uploadImage, uploading } = useImageUpload();
  const { user } = useAuth();

  const handleFile = async (file: File) => {
    if (!user) return;
    const url = await uploadImage(file, user.id, folder);
    if (url) onChange(url);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleFile(file);
  };

  return (
    <div>
      <label className="text-sm font-medium text-foreground">
        {label} {required && <span className="text-primary">*</span>}
      </label>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />

      {value ? (
        <div className="mt-1 relative rounded-xl border border-border overflow-hidden group">
          <img src={value} alt={label} className="w-full max-h-48 object-contain bg-secondary" />
          <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button onClick={() => fileRef.current?.click()} className="p-2 rounded-full bg-primary text-primary-foreground" title="Replace">
              <Edit2 className="h-4 w-4" />
            </button>
            <button onClick={() => onChange("")} className="p-2 rounded-full bg-destructive text-destructive-foreground" title="Remove">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={`mt-1 flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 hover:border-primary/50 transition-colors cursor-pointer ${error ? "border-destructive" : "border-border"}`}
        >
          {uploading ? (
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-semibold text-foreground">Drop image here or click to upload</p>
              {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
            </>
          )}
        </div>
      )}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}
