import { Download, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import { APK_FILENAME, getApkUrl } from "@/lib/site-config";
import { cn } from "@/lib/utils";

interface AppDownloadButtonsProps {
  variant?: "footer" | "bar" | "stack" | "hero" | "card";
  className?: string;
}

export function AppDownloadButtons({ variant = "stack", className }: AppDownloadButtonsProps) {
  const { install, showPwa, showApk, canPromptPwa } = usePwaInstall();

  if (!showPwa && !showApk) return null;

  const apkUrl = getApkUrl();
  const isFooter = variant === "footer";
  const isBar = variant === "bar";
  const isHero = variant === "hero";
  const isCard = variant === "card";

  return (
    <div
      className={cn(
        isBar && "flex flex-wrap gap-2",
        variant === "stack" && "flex flex-col gap-2",
        (isHero || isCard) && "flex flex-col sm:flex-row flex-wrap gap-2.5",
        isFooter && "space-y-0",
        className,
      )}
    >
      {showApk && (
        <Button
          asChild
          size={isHero || isCard ? "lg" : "sm"}
          className={cn(
            "rounded-xl font-bold gap-2",
            isFooter &&
              "w-full bg-[#3DDC84] text-[#0d3d22] hover:bg-[#3DDC84]/90 border-0 shadow-md",
            isBar && "flex-1 min-w-[140px] bg-[#3DDC84] text-[#0d3d22] hover:bg-[#3DDC84]/90",
            variant === "stack" && "w-full",
            isHero &&
              "w-full sm:w-auto bg-[#3DDC84] text-[#0d3d22] hover:bg-[#3DDC84]/90 border-0 shadow-lg h-11 sm:h-12",
            isCard &&
              "flex-1 min-w-[160px] bg-[#3DDC84] text-[#0d3d22] hover:bg-[#3DDC84]/90 border-0 shadow-md",
          )}
        >
          <a href={apkUrl} download={APK_FILENAME}>
            <Smartphone className="h-4 w-4 shrink-0" />
            Скачать APK
            <Download className="h-4 w-4 shrink-0 opacity-80" />
          </a>
        </Button>
      )}

      {showPwa && (
        <Button
          type="button"
          size={isHero || isCard ? "lg" : "sm"}
          variant={isFooter ? "outline" : isHero ? "outline" : "secondary"}
          className={cn(
            "rounded-xl font-bold gap-2",
            isFooter &&
              "w-full border-white/25 bg-white/10 text-secondary-foreground hover:bg-white/20 hover:text-white",
            isBar && "flex-1 min-w-[140px]",
            variant === "stack" && "w-full",
            isHero &&
              "w-full sm:w-auto border-white/35 bg-white/10 text-white hover:bg-white/20 hover:text-white h-11 sm:h-12",
            isCard && "flex-1 min-w-[160px]",
          )}
          onClick={() => install()}
        >
          <Download className="h-4 w-4 shrink-0" />
          {canPromptPwa ? "Установить PWA" : "Установить на экран"}
        </Button>
      )}
    </div>
  );
}
