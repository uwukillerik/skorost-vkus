import { Smartphone, Download, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const APK_URL = "/downloads/skorost-vkus.apk";
const APK_FILENAME = "skorost-vkus.apk";

interface AndroidAppDownloadProps {
  variant?: "banner" | "compact" | "footer";
  className?: string;
}

export function AndroidAppDownload({
  variant = "banner",
  className,
}: AndroidAppDownloadProps) {
  if (variant === "compact") {
    return (
      <a
        href={APK_URL}
        download={APK_FILENAME}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl bg-[#3DDC84] text-[#0d3d22] px-4 py-2.5 text-sm font-bold shadow-md hover:brightness-105 transition-all w-full max-w-md mx-auto",
          className,
        )}
      >
        <Smartphone className="h-4 w-4" />
        Скачать для Android
        <Download className="h-4 w-4 opacity-80" />
      </a>
    );
  }

  if (variant === "footer") {
    return (
      <div className={cn("space-y-3", className)}>
        <h4 className="font-semibold flex items-center gap-2">
          <Smartphone className="h-4 w-4 text-[#3DDC84]" />
          Мобильное приложение
        </h4>
        <p className="text-sm opacity-80">
          Установите APK на Android — заказы, меню и push как на сайте.
        </p>
        <a
          href={APK_URL}
          download={APK_FILENAME}
          className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-[#3DDC84] text-[#0d3d22] px-4 py-3 text-sm font-bold hover:brightness-105 transition-all"
        >
          <Download className="h-4 w-4" />
          Скачать APK
        </a>
        <p className="text-[10px] opacity-60">
          Разрешите установку из неизвестных источников в настройках.
        </p>
      </div>
    );
  }

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-[#3DDC84]/30 bg-gradient-to-br from-[#3DDC84]/15 via-card to-emerald-500/5 p-5 sm:p-8 shadow-lg",
        className,
      )}
    >
      <div className="flex flex-col sm:flex-row gap-5 sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-[#3DDC84] flex items-center justify-center shrink-0 shadow-md">
            <Smartphone className="h-8 w-8 text-[#0d3d22]" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#2a9d5c] uppercase tracking-wide mb-1">
              Android
            </p>
            <h2 className="text-xl sm:text-2xl font-extrabold text-foreground">
              Скачайте приложение
            </h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              Меню, корзина, заказы и уведомления — в одном APK. Работает с
              вашим сервером в локальной сети или на хостинге.
            </p>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
              <Shield className="h-3.5 w-3.5" />
              Файл: {APK_FILENAME}
            </p>
          </div>
        </div>
        <Button
          asChild
          size="lg"
          className="rounded-2xl h-12 sm:h-14 px-8 font-black bg-[#3DDC84] text-[#0d3d22] hover:bg-[#3DDC84]/90 shadow-md shrink-0 w-full sm:w-auto"
        >
          <a href={APK_URL} download={APK_FILENAME}>
            <Download className="h-5 w-5 mr-2" />
            Скачать для Android
          </a>
        </Button>
      </div>
    </section>
  );
}
