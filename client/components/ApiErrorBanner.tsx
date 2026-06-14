import { AlertCircle, RefreshCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ApiErrorBannerProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ApiErrorBanner({
  message = "Не удалось загрузить данные с сервера",
  onRetry,
  className,
}: ApiErrorBannerProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-destructive/30 bg-destructive/5 p-4 sm:p-5",
        className,
      )}
    >
      <div className="flex gap-3">
        <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
          <WifiOff className="h-5 w-5 text-destructive" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-sm sm:text-base">{message}</p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Проверьте интернет. Если проблема остаётся — обновите приложение или
            откройте сайт в браузере.
          </p>
          {onRetry && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3 rounded-xl gap-2"
              onClick={onRetry}
            >
              <RefreshCw className="h-4 w-4" />
              Повторить
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function MenuLoadError({
  onRetry,
  className,
}: {
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("page-container py-8", className)}>
      <ApiErrorBanner
        message="Меню не загрузилось"
        onRetry={onRetry}
      />
      <p className="text-xs text-muted-foreground mt-4 flex items-start gap-2">
        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
        Убедитесь, что установлена последняя версия APK и сервер доступен.
      </p>
    </div>
  );
}
