import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { PromoBanner } from "@/components/PromoBanner";
import { ProductCard } from "@/components/ProductCard";
import { useProducts, useCombos, useCategories } from "@/hooks/use-menu";
import { CategoryGrid } from "@/components/CategoryGrid";
import { ComboCard } from "@/components/ComboCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { QuickActions } from "@/components/home/QuickActions";
import { HomeAppDownload } from "@/components/home/HomeAppDownload";
import { SafeImage } from "@/components/SafeImage";
import { BRAND_LOGO_URL } from "@/lib/brand-assets";
import {
  Clock,
  Heart,
  Leaf,
  Truck,
  Gift,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default function Index() {
  const { data: featured = [], isLoading } = useProducts({ featured: true });
  const { data: combos = [], isLoading: combosLoading } = useCombos();
  const { data: catalog = [] } = useProducts();
  const { data: categories = [], isLoading: catLoading } = useCategories();

  const benefits = [
    {
      icon: Clock,
      title: "Быстро готовим",
      desc: "Среднее время доставки — около 20 минут",
      color: "from-orange-500/15 to-amber-500/5",
    },
    {
      icon: Leaf,
      title: "Свежие продукты",
      desc: "Поставки каждый день, без заморозки котлет",
      color: "from-emerald-500/15 to-green-500/5",
    },
    {
      icon: Heart,
      title: "Свои рецепты",
      desc: "Соусы и маринады готовим на нашей кухне",
      color: "from-rose-500/15 to-pink-500/5",
    },
    {
      icon: Truck,
      title: "Удобная доставка",
      desc: "Бесплатно при заказе от 600 ₽ по городу",
      color: "from-sky-500/15 to-blue-500/5",
    },
  ];

  return (
    <Layout>
      <div className="pt-2 sm:pt-5 bg-muted/20">
        <PromoBanner />
        <HomeAppDownload />
        <QuickActions />
      </div>

      <section className="page-container py-8 sm:py-12 hidden sm:block">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 text-primary font-bold text-xs mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              Быстрый выбор
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              Категории
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Нажмите — откроем нужный раздел меню
            </p>
          </div>
          <Button asChild variant="ghost" className="font-semibold text-primary shrink-0">
            <Link to="/menu">
              Всё меню
              <ChevronRight className="h-4 w-4 ml-0.5" />
            </Link>
          </Button>
        </div>
        {catLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[76px] rounded-xl" />
            ))}
          </div>
        ) : (
          <CategoryGrid
            categories={categories}
            onSelect={(slug) => {
              window.location.assign(`/menu#${slug}`);
            }}
          />
        )}
      </section>

      <section className="relative py-12 sm:py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary to-[hsl(24_28%_22%)]" />
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)),transparent_50%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 text-accent font-bold text-sm mb-2">
                <Gift className="h-4 w-4" />
                Выгодные наборы
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
                Комбо со скидкой
              </h2>
              <p className="text-white/65 mt-2 text-sm sm:text-base max-w-lg">
                Бургер или курица + гарнир + напиток — дешевле, чем по отдельности
              </p>
            </div>
            <Button
              asChild
              className="bg-accent text-accent-foreground font-bold rounded-xl shrink-0 w-full sm:w-auto"
            >
              <Link to="/menu">Смотреть все комбо</Link>
            </Button>
          </div>
          {combosLoading ? (
            <Skeleton className="h-56 w-full rounded-2xl bg-white/10" />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {combos.slice(0, 2).map((c, i) => (
                <ComboCard
                  key={c.id}
                  combo={c}
                  catalog={catalog}
                  variant={i === 0 ? "wide" : "default"}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-3">
          Почему заказывают у нас
        </h2>
        <p className="text-center text-muted-foreground text-sm mb-10 max-w-md mx-auto">
          Не копируем чужие слоганы — просто делаем вкусно и вовремя
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {benefits.map((b) => (
            <div
              key={b.title}
              className={`warm-card p-5 bg-gradient-to-br ${b.color}`}
            >
              <div className="inline-flex p-2.5 rounded-xl bg-primary/10 mb-3">
                <b.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold text-base mb-1">{b.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {b.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-muted/40 py-10 sm:py-16">
        <div className="page-container">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-6 sm:mb-8 gap-3 sm:gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold">Популярное</h2>
              <p className="text-muted-foreground text-sm mt-1">
                То, что чаще всего заказывают на этой неделе
              </p>
            </div>
            <Button asChild variant="outline" className="hidden sm:flex rounded-xl font-semibold">
              <Link to="/menu">Все блюда</Link>
            </Button>
          </div>
          {isLoading ? (
            <div className="product-grid-home">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-64 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="product-grid-home">
              {featured.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="page-container py-8 sm:py-12">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-primary via-orange-500 to-amber-500 p-6 sm:p-12 text-center text-white shadow-xl">
          <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
          <SafeImage
            src={BRAND_LOGO_URL}
            alt=""
            className="h-14 w-14 mx-auto mb-4 rounded-xl bg-white/90 p-1.5 object-contain"
          />
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3 relative">
            Голодны? Соберите заказ за пару минут
          </h2>
          <p className="text-white/90 mb-8 max-w-lg mx-auto text-sm sm:text-base relative">
            Более 40 позиций в меню, бонусы за каждый заказ и доставка до двери
          </p>
          <Button
            asChild
            size="lg"
            className="relative bg-white text-primary hover:bg-white/95 font-bold h-12 px-10 rounded-xl shadow-lg"
          >
            <Link to="/menu">Перейти в меню</Link>
          </Button>
        </div>
      </section>

      <section className="page-container pb-12 sm:pb-16 grid grid-cols-3 gap-2 sm:gap-8 text-center">
        {[
          { n: "40+", l: "Блюд в меню" },
          { n: "~20", l: "Минут доставка" },
          { n: "4.8", l: "Средняя оценка" },
        ].map((s) => (
          <div key={s.l} className="warm-card py-4 sm:py-5 px-2">
            <p className="text-xl sm:text-4xl font-extrabold text-gradient-brand">
              {s.n}
            </p>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">{s.l}</p>
          </div>
        ))}
      </section>
    </Layout>
  );
}
