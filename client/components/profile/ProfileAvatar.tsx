import { useRef, useState } from "react";
import type { UserPublic } from "@shared/api";
import { api } from "@/lib/api";
import { readImageAsDataUrl, initialsFromName } from "@/lib/avatar-image";
import { cn } from "@/lib/utils";
import { Camera, Loader2, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ProfileAvatarProps {
  user: UserPublic;
  size?: "md" | "lg" | "xl";
  onUpdated: () => void;
  showActions?: boolean;
  /** Компактный режим: только аватар и кнопка камеры, без кнопок и подсказки */
  compact?: boolean;
  className?: string;
}

const sizes = {
  md: { wrap: "h-20 w-20 sm:h-24 sm:w-24", text: "text-xl sm:text-2xl", btn: "h-8 w-8 sm:h-9 sm:w-9" },
  lg: { wrap: "h-28 w-28 sm:h-36 sm:w-36", text: "text-2xl sm:text-3xl", btn: "h-9 w-9 sm:h-10 sm:w-10" },
  xl: { wrap: "h-32 w-32 sm:h-44 sm:w-44", text: "text-3xl sm:text-4xl", btn: "h-10 w-10 sm:h-11 sm:w-11" },
};

export function ProfileAvatar({
  user,
  size = "lg",
  onUpdated,
  showActions = true,
  compact = false,
  className,
}: ProfileAvatarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const s = sizes[size];
  const hasAvatar = !!user.avatarUrl;

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await readImageAsDataUrl(file);
      await api.auth.uploadAvatar(dataUrl);
      await onUpdated();
      toast.success("Фото профиля обновлено");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка загрузки");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    setUploading(true);
    try {
      await api.auth.deleteAvatar();
      await onUpdated();
      toast.success("Фото удалено");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setUploading(false);
    }
  };

  const showActionButtons = showActions && !compact;

  return (
    <div
      className={cn(
        compact ? "shrink-0" : "flex flex-col items-center gap-3 sm:gap-4",
        className,
      )}
    >
      <div className="relative">
        <div
          className={cn(
            "rounded-full p-0.5 sm:p-1 bg-gradient-to-br from-primary via-orange-500 to-amber-400 shadow-lg sm:shadow-xl",
            uploading && "opacity-70",
          )}
        >
          <div
            className={cn(
              "rounded-full overflow-hidden bg-muted ring-2 sm:ring-4 ring-card flex items-center justify-center",
              s.wrap,
            )}
          >
            {hasAvatar ? (
              <img
                src={user.avatarUrl!}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className={cn(
                  "h-full w-full flex items-center justify-center font-black text-white bg-gradient-to-br from-primary to-orange-600",
                  s.text,
                )}
              >
                {initialsFromName(user.name)}
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </div>
            )}
          </div>
        </div>

        {showActions && !uploading && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={cn(
              "absolute bottom-0 right-0 rounded-full bg-primary text-primary-foreground shadow-lg border-2 sm:border-4 border-card flex items-center justify-center hover:scale-105 transition-transform",
              s.btn,
            )}
            aria-label="Сменить фото"
          >
            <Camera className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFile}
      />

      {showActionButtons && (
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full font-semibold"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            <Camera className="h-4 w-4 mr-1.5" />
            {hasAvatar ? "Сменить фото" : "Загрузить фото"}
          </Button>
          {hasAvatar && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-full text-muted-foreground"
              disabled={uploading}
              onClick={handleRemove}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Удалить
            </Button>
          )}
        </div>
      )}

      {showActionButtons && (
        <p className="text-xs text-muted-foreground text-center max-w-[220px]">
          JPG, PNG или WebP · до 2 МБ после сжатия
        </p>
      )}
    </div>
  );
}

export function UserAvatarBubble({
  user,
  className,
}: {
  user: UserPublic;
  className?: string;
}) {
  if (user.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt=""
        className={cn("rounded-full object-cover", className)}
      />
    );
  }
  return (
    <span
      className={cn(
        "rounded-full flex items-center justify-center font-bold text-white bg-gradient-to-br from-primary to-orange-600",
        className,
      )}
    >
      {initialsFromName(user.name).slice(0, 1) || <User className="h-4 w-4" />}
    </span>
  );
}
