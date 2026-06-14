import { Smartphone } from "lucide-react";
import { AppDownloadButtons } from "@/components/AppDownloadButtons";
import { SafeImage } from "@/components/SafeImage";
import { BRAND_LOGO_URL } from "@/lib/brand-assets";

export function HomeAppDownload() {
  return (
    <section className="page-container py-4 sm:py-6">
      <div className="warm-card p-4 sm:p-6 bg-gradient-to-br from-primary/8 via-card to-emerald-500/10 border-primary/15">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <SafeImage
              src={BRAND_LOGO_URL}
              alt=""
              className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl object-contain bg-card shadow-md p-1"
            />
            <div>
              <div className="inline-flex items-center gap-1.5 text-primary font-bold text-xs mb-1">
                <Smartphone className="h-3.5 w-3.5" />
                Мобильное приложение
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-foreground leading-tight">
                Скачайте или установите
              </h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                APK для Android или PWA на экран телефона — заказ в один клик
              </p>
            </div>
          </div>
          <div className="sm:ml-auto w-full sm:w-auto min-w-0">
            <AppDownloadButtons variant="card" className="sm:justify-end" />
          </div>
        </div>
      </div>
    </section>
  );
}
