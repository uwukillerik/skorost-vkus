import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { isNativeApp } from "@/lib/api-base";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function usePwaInstall() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    setIsStandalone(standalone);

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setIsStandalone(true);
      setDeferred(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (deferred) {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      if (outcome === "accepted") {
        setDeferred(null);
        toast.success("Приложение установлено");
      }
      return;
    }

    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (isIos) {
      toast.info("На iPhone: «Поделиться» → «На экран Домой»", { duration: 5000 });
    } else {
      toast.info("В меню браузера выберите «Установить приложение» или «Добавить на экран»", {
        duration: 5000,
      });
    }
  }, [deferred]);

  const inNativeApp = isNativeApp();
  const showPwa = !inNativeApp && !isStandalone;
  const showApk = !inNativeApp;
  const canPromptPwa = Boolean(deferred);

  return {
    install,
    showPwa,
    showApk,
    canPromptPwa,
    isStandalone,
    inNativeApp,
  };
}
