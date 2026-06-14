import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallBanner({ className }: { className?: string }) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }

    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed) setHidden(true);

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "accepted") setDeferred(null);
  };

  const dismiss = () => {
    setHidden(true);
    localStorage.setItem("pwa-install-dismissed", "1");
  };

  if (installed || hidden || !deferred) return null;

  return (
    <div
      className={cn(
        "fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50",
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
        <img src="/Logo.png" alt="" className="h-12 w-12 rounded-xl object-contain shrink-0" />
        <div>
          <p className="font-bold text-sm">Установить приложение</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Быстрый доступ с иконки на экране — работает как PWA
          </p>
        </div>
      </div>
      <Button className="w-full mt-3 rounded-xl font-bold" size="sm" onClick={handleInstall}>
        <Download className="h-4 w-4 mr-2" />
        Установить
      </Button>
    </div>
  );
}
