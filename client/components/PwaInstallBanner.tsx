import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { SafeImage } from "@/components/SafeImage";
import { BRAND_LOGO_URL } from "@/lib/brand-assets";
import { Button } from "@/components/ui/button";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import { cn } from "@/lib/utils";

export function PwaInstallBanner({ className }: { className?: string }) {
  const { install, showPwa, canPromptPwa } = usePwaInstall();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("pwa-install-dismissed")) setHidden(true);
  }, []);

  const dismiss = () => {
    setHidden(true);
    localStorage.setItem("pwa-install-dismissed", "1");
  };

  if (!showPwa || hidden || !canPromptPwa) return null;

  return (
    <div
      className={cn(
        "fixed bottom-[calc(var(--bottom-nav-h)+env(safe-area-inset-bottom,0px)+0.5rem)] md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50",
        "bg-card border-2 border-primary/20 shadow-2xl rounded-2xl p-4 animate-in slide-in-from-bottom-4",
        className,
      )}
    >
      <button
        type="button"
        onClick={dismiss}
        className="absolute top-2 right-2 p-1 rounded-lg hover:bg-muted text-muted-foreground"
        aria-label="Закрыть"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex gap-3 pr-6">
        <SafeImage src={BRAND_LOGO_URL} alt="" className="h-12 w-12 rounded-xl object-contain shrink-0" />
        <div>
          <p className="font-bold text-sm">Установить приложение</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Иконка на экране — быстрый заказ без браузера
          </p>
        </div>
      </div>
      <Button className="w-full mt-3 rounded-xl font-bold" size="sm" onClick={() => install()}>
        <Download className="h-4 w-4 mr-2" />
        Установить PWA
      </Button>
    </div>
  );
}
