import { Link } from "react-router-dom";
import { ArrowRight, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SafeImage } from "@/components/SafeImage";
import { BRAND_LOGO_URL } from "@/lib/brand-assets";

export function PromoBanner() {
  const logoBg = BRAND_LOGO_URL;

  return (
    <section className="relative overflow-hidden hero-mesh text-white rounded-2xl sm:rounded-3xl mx-4 sm:mx-5 lg:mx-6 shadow-lg sm:shadow-2xl">
      <div
        className="absolute inset-0 opacity-[0.06] bg-center bg-no-repeat bg-[length:min(200px,70%)] sm:bg-[length:min(420px,70%)] pointer-events-none"
        style={{ backgroundImage: `url(${logoBg})` }}
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-16 md:py-20 lg:px-12">
        <div className="grid lg:grid-cols-[1fr_auto] gap-8 lg:gap-10 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1 text-[11px] sm:text-sm font-semibold mb-4 sm:mb-6">
              <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-accent animate-pulse shrink-0" />
              <span className="sm:hidden">Открыто до 23:00</span>
              <span className="hidden sm:inline">
                Доставка по городу · кухня открыта до 23:00
              </span>
            </div>
            <div className="flex flex-col items-center lg:items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
              <SafeImage
                src={BRAND_LOGO_URL}
                alt="Скорость и Вкус"
                className="h-16 w-16 sm:h-24 sm:w-24 rounded-2xl object-contain bg-white/95 p-1.5 sm:p-2 shadow-xl"
              />
              <div>
                <h1 className="text-[1.65rem] leading-tight min-[380px]:text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                  Скорость &{" "}
                  <span className="text-accent">Вкус</span>
                </h1>
                <p className="text-white/75 mt-1.5 text-sm sm:text-base max-w-md mx-auto lg:mx-0">
                  Своя кухня и доставка за 20–25 минут
                </p>
              </div>
            </div>
            <p className="hidden sm:block text-base sm:text-lg text-white/85 mb-6 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Бургеры на гриле, хрустящая курица, закуски и десерты — привезём
              горячим.
            </p>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap justify-center lg:justify-start sm:gap-3 mb-5 sm:mb-8 max-w-xs sm:max-w-none mx-auto lg:mx-0">
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 bg-white/10 rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 border border-white/10">
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent shrink-0" />
                <span className="text-xs sm:text-sm font-medium">~20 мин</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 bg-white/10 rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 border border-white/10">
                <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent shrink-0" />
                <span className="text-xs sm:text-sm font-medium">Доставка</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-2.5 sm:gap-3 max-w-sm sm:max-w-none mx-auto lg:mx-0">
              <Button
                asChild
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold h-11 sm:h-12 px-6 sm:px-8 rounded-xl shadow-lg w-full sm:w-auto"
              >
                <Link to="/menu">
                  Открыть меню
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-black/40 text-black hover:bg-black/10 h-11 sm:h-12 rounded-xl w-full sm:w-auto"
              >
                <Link to="/register">Получить бонусы</Link>
              </Button>
            </div>
          </div>
          <div className="hidden lg:block relative">
            <SafeImage
              src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=480&h=480&fit=crop"
              alt=""
              className="w-72 h-72 object-cover rounded-3xl shadow-2xl rotate-2 border-4 border-white/20"
            />
            <div className="absolute -bottom-3 -left-3 bg-accent text-accent-foreground font-extrabold text-lg px-5 py-2.5 rounded-2xl shadow-lg -rotate-3">
              от 99 ₽
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
