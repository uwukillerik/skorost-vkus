import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { readImageAsDataUrl } from "@/lib/avatar-image";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { SafeImage } from "@/components/SafeImage";

type UploadFolder = "products" | "categories" | "combos";

interface AdminImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder: UploadFolder;
  label?: string;
  className?: string;
}

export function AdminImageUpload({
  value,
  onChange,
  folder,
  label = "Изображение",
  className,
}: AdminImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const dataUrl = await readImageAsDataUrl(file, 1024);
      const { url } = await api.admin.upload(dataUrl, folder);
      onChange(url);
      toast.success("Изображение загружено");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка загрузки");
    } finally {
      setUploading(false);
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) void handleFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-sm font-medium">{label}</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={onInputChange}
      />

      {value ? (
        <div className="relative group rounded-2xl overflow-hidden border-2 border-border bg-muted/30">
          <SafeImage
            src={value}
            alt=""
            className="w-full h-44 object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-4 py-2 rounded-xl bg-white text-foreground text-sm font-semibold"
            >
              Заменить
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="p-2 rounded-xl bg-destructive text-destructive-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          className={cn(
            "w-full h-44 rounded-2xl border-2 border-dashed border-primary/30",
            "bg-gradient-to-br from-primary/5 to-accent/5",
            "flex flex-col items-center justify-center gap-2 text-muted-foreground",
            "hover:border-primary/50 hover:bg-primary/10 transition-colors",
          )}
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          ) : (
            <>
              <ImagePlus className="h-8 w-8 text-primary" />
              <span className="text-sm font-medium text-foreground">
                Нажмите или перетащите фото
              </span>
              <span className="text-xs">JPG, PNG, WebP до 5 МБ</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
