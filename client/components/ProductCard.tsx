import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import type { ProductDto } from "@shared/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

export function ProductCard({ product }: { product: ProductDto }) {
  const { addItem } = useCart();

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success(product.name, { description: "Добавлено в корзину" });
  };

  return (
    <div className="group warm-card overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-primary/30 flex flex-row min-[480px]:flex-col h-full min-w-0">
      <Link
        to={`/product/${product.slug}`}
        className="block relative shrink-0 w-[7.25rem] h-[7.25rem] min-[480px]:w-full min-[480px]:h-auto min-[480px]:aspect-square overflow-hidden bg-muted"
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {product.isFeatured && (
          <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground font-black text-[10px] border-0">
            ХИТ
          </Badge>
        )}
        {product.calories && (
          <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            {product.calories} ккал
          </span>
        )}
      </Link>
      <div className="p-3 sm:p-4 flex flex-col flex-1 min-w-0 justify-center sm:justify-start">
        <Link to={`/product/${product.slug}`} className="min-w-0">
          <h3 className="font-bold text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 line-clamp-2 flex-1 hidden sm:block">
          {product.description}
        </p>
        <div className="flex items-center justify-between mt-2 sm:mt-3 gap-2">
          <span className="text-base sm:text-2xl font-black text-primary">
            {product.price}₽
          </span>
          <Button
            size="icon"
            className="rounded-full h-9 w-9 sm:h-10 sm:w-10 bg-primary hover:bg-primary/90 shadow-md shrink-0"
            onClick={handleAdd}
            aria-label={`Добавить ${product.name}`}
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
