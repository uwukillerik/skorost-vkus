import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { SafeImage } from "@/components/SafeImage";
import Layout from "@/components/Layout";
import { useProductDetail } from "@/hooks/use-menu";
import { useCart } from "@/context/CartContext";
import { ProductCustomizer } from "@/components/product/ProductCustomizer";
import { UpsellDialog } from "@/components/product/UpsellDialog";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Flame, Wheat, AlertTriangle, ListChecks } from "lucide-react";
import { toast } from "sonner";
import type { ProductCustomization } from "@/lib/product-customization";
import { parseIngredients } from "@/lib/product-customization";

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading } = useProductDetail(slug || "");
  const { addItem } = useCart();
  const [upsellOpen, setUpsellOpen] = useState(false);
  const [lastAddedName, setLastAddedName] = useState("");

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8 page-with-bottom-nav">
          <Skeleton className="h-80 w-full rounded-2xl" />
        </div>
      </Layout>
    );
  }

  const product = data?.product;
  if (!product) {
    return (
      <Layout>
        <div className="max-w-lg mx-auto px-4 py-16 text-center page-with-bottom-nav">
          <p>Товар не найден</p>
          <Button asChild className="mt-4">
            <Link to="/menu">В меню</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const ingredientList = parseIngredients(product.ingredients);

  const handleAdd = (quantity: number, customization: ProductCustomization) => {
    addItem(product, quantity, customization);
    setLastAddedName(product.name);
    setUpsellOpen(true);
    toast.success(
      quantity > 1 ? `${quantity}× в корзине` : "Добавлено в корзину",
    );
  };

  return (
    <Layout>
      <div className="page-container max-w-4xl py-4 sm:py-8 page-with-bottom-nav">
        <Button variant="ghost" asChild className="mb-4 -ml-2">
          <Link to="/menu">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Меню
          </Link>
        </Button>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-10">
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl sm:shadow-2xl aspect-[4/3] sm:aspect-square max-h-[280px] sm:max-h-[420px] lg:max-h-none">
            <SafeImage
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.isFeatured && (
              <Badge className="absolute top-4 left-4 bg-accent text-secondary font-black">
                ХИТ
              </Badge>
            )}
            {product.calories && (
              <div className="absolute bottom-4 left-4 bg-black/70 text-white text-sm font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                <Flame className="h-4 w-4 text-orange-400" />
                {product.calories} ккал
              </div>
            )}
          </div>

          <div>
            <p className="text-primary font-black text-xs uppercase tracking-widest">
              {product.categoryName}
            </p>
            <h1 className="font-display text-2xl min-[380px]:text-3xl sm:text-4xl mt-1 mb-3">
              {product.name}
            </h1>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {product.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {product.weightGrams && (
                <span className="text-xs font-bold bg-muted px-3 py-1 rounded-full">
                  {product.weightGrams} г
                </span>
              )}
              {product.protein && (
                <span className="text-xs font-bold bg-muted px-3 py-1 rounded-full">
                  Белок {product.protein} г
                </span>
              )}
            </div>

            <p className="text-3xl sm:text-4xl font-black text-primary mb-5">
              от {product.price}₽
            </p>

            <ProductCustomizer product={product} onAdd={handleAdd} />

            <Tabs defaultValue="ingredients" className="w-full mt-8">
              <TabsList className="w-full grid grid-cols-3 h-11 rounded-xl">
                <TabsTrigger
                  value="ingredients"
                  className="font-bold text-xs sm:text-sm gap-1"
                >
                  <ListChecks className="h-3.5 w-3.5 hidden sm:block" />
                  Состав
                </TabsTrigger>
                <TabsTrigger value="nutrition" className="font-bold text-xs sm:text-sm">
                  Питание
                </TabsTrigger>
                <TabsTrigger value="allergens" className="font-bold text-xs sm:text-sm">
                  Аллергены
                </TabsTrigger>
              </TabsList>
              <TabsContent value="ingredients" className="mt-4">
                <ul className="space-y-2">
                  {ingredientList.map((ing) => (
                    <li
                      key={ing}
                      className="flex items-center gap-2 text-sm bg-muted/40 rounded-lg px-3 py-2"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      {ing}
                    </li>
                  ))}
                </ul>
              </TabsContent>
              <TabsContent value="nutrition" className="mt-4">
                <div className="grid grid-cols-2 gap-3">
                  <NutritionCell
                    label="Калории"
                    value={product.calories ? `${product.calories} ккал` : "—"}
                  />
                  <NutritionCell
                    label="Белки"
                    value={product.protein ? `${product.protein} г` : "—"}
                  />
                  <NutritionCell
                    label="Вес"
                    value={product.weightGrams ? `${product.weightGrams} г` : "—"}
                  />
                  <NutritionCell label="Базовая цена" value={`${product.price} ₽`} />
                </div>
              </TabsContent>
              <TabsContent value="allergens" className="mt-4">
                <div className="flex gap-2 text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <AlertTriangle className="h-5 w-5 shrink-0" />
                  <p>
                    {product.allergens ||
                      "Может содержать глютен, молоко, сою, яйца, горчицу."}
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {data?.relatedProducts && data.relatedProducts.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-2xl mb-4">Похожие блюда</h2>
            <div className="product-grid max-w-lg sm:max-w-none mx-auto sm:mx-0">
              {data.relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {data && (
        <UpsellDialog
          open={upsellOpen}
          onOpenChange={setUpsellOpen}
          addedName={lastAddedName}
          drinks={data.suggestDrinks}
          sides={data.suggestSides}
          related={data.relatedProducts}
        />
      )}
    </Layout>
  );
}

function NutritionCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/50 rounded-xl p-3 text-center">
      <Wheat className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
      <p className="text-[10px] uppercase text-muted-foreground font-bold">
        {label}
      </p>
      <p className="font-black text-sm">{value}</p>
    </div>
  );
}
