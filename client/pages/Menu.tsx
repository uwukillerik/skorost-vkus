import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import { CategoryStrip } from "@/components/CategoryStrip";
import { CategoryGrid } from "@/components/CategoryGrid";
import { ProductCard } from "@/components/ProductCard";
import { ComboCard } from "@/components/ComboCard";
import { SafeImage } from "@/components/SafeImage";
import { BRAND_LOGO_URL } from "@/lib/brand-assets";
import { MenuLoadError } from "@/components/ApiErrorBanner";
import { useCategories, useProducts, useCombos } from "@/hooks/use-menu";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";

export default function Menu() {
  const location = useLocation();
  const categoriesQuery = useCategories();
  const combosQuery = useCombos();
  const categories = categoriesQuery.data ?? [];
  const catLoading = categoriesQuery.isLoading;
  const combos = combosQuery.data ?? [];
  const combosLoading = combosQuery.isLoading;
  const { data: catalog = [] } = useProducts();
  const hashSlug = location.hash.replace("#", "");
  const [activeSlug, setActiveSlug] = useState(hashSlug || "combos");

  useEffect(() => {
    if (hashSlug) setActiveSlug(hashSlug);
  }, [hashSlug]);

  const isCombosView = activeSlug === "combos";
  const { data: products = [], isLoading: prodLoading } = useProducts({
    category: isCombosView ? undefined : activeSlug || undefined,
  });

  const displayCategories = [
    { id: "combos", name: "Комбо", slug: "combos", emoji: "🍱", sortOrder: 0, isActive: true },
    ...categories,
  ];

  const menuLoadFailed =
    categoriesQuery.isError &&
    combosQuery.isError &&
    !catLoading &&
    !combosLoading;

  const retryMenu = () => {
    categoriesQuery.refetch();
    combosQuery.refetch();
  };

  return (
    <Layout>
      <div className="hero-mesh text-white pt-6 pb-6 sm:pt-8 sm:pb-8">
        <div className="page-container flex items-center gap-3 sm:gap-4">
          <SafeImage
            src={BRAND_LOGO_URL}
            alt=""
            className="h-12 w-12 rounded-xl bg-white/95 p-1 object-contain shadow-lg shrink-0"
          />
          <div>
            <h1 className="text-xl min-[380px]:text-2xl sm:text-4xl font-extrabold">Меню</h1>
            <p className="text-white/70 mt-1 text-sm">
              Комбо, бургеры, курица и не только
            </p>
          </div>
        </div>
      </div>

      {menuLoadFailed ? (
        <MenuLoadError onRetry={retryMenu} />
      ) : (
        <>
      <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 py-4">
        {catLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[76px] rounded-xl" />
            ))}
          </div>
        ) : (
          <CategoryGrid
            categories={[
              {
                id: "combos",
                name: "Комбо",
                slug: "combos",
                emoji: "🍱",
                sortOrder: 0,
                isActive: true,
                description: "Наборы со скидкой",
                imageUrl:
                  "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&h=240&fit=crop",
              },
              ...categories,
            ]}
            activeSlug={activeSlug || "combos"}
            onSelect={setActiveSlug}
          />
        )}
      </div>

      <div className="sticky top-14 sm:top-16 z-40 bg-background/95 backdrop-blur border-b py-2 shadow-sm md:hidden">
        <div className="page-container">
          <CategoryStrip
            categories={displayCategories}
            activeSlug={activeSlug || "combos"}
            onSelect={setActiveSlug}
          />
        </div>
      </div>

      <div className="page-container py-5 sm:py-6 page-with-bottom-nav">
        {isCombosView ? (
          <>
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-black">Выгодные комбо</h2>
            </div>
            {combosLoading ? (
              <div className="grid gap-6">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-56 rounded-2xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
                {combos.map((c, i) => (
                  <ComboCard
                    key={c.id}
                    combo={c}
                    catalog={catalog}
                    variant={i === 0 ? "wide" : "default"}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {prodLoading ? (
              <div className="product-grid">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-64 rounded-2xl" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">
                В этой категории пока нет товаров
              </p>
            ) : (
              <div className="product-grid mb-12">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </>
        )}

        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-primary via-red-600 to-primary p-6 sm:p-10 text-center text-white">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
          <h2 className="relative text-2xl sm:text-3xl font-black mb-3">
            ГОЛОДНЫ? ЗАКАЖИ СЕЙЧАС
          </h2>
          <p className="relative mb-6 text-white/90">Доставка 15–20 минут</p>
          <Button
            asChild
            size="lg"
            className="relative bg-accent text-secondary font-black h-12 px-10 rounded-full hover:scale-105 transition-transform"
          >
            <Link to="/checkout">В корзину</Link>
          </Button>
        </div>
      </div>
        </>
      )}
    </Layout>
  );
}
