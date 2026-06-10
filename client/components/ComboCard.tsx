import { useState } from "react";
import { Settings2, Tag } from "lucide-react";
import type { ComboDto, ProductDto } from "@shared/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ComboBuilderDialog } from "@/components/combo/ComboBuilderDialog";

export function ComboCard({
  combo,
  catalog,
  variant = "default",
}: {
  combo: ComboDto;
  catalog: ProductDto[];
  variant?: "default" | "wide";
}) {
  const [builderOpen, setBuilderOpen] = useState(false);

  return (
    <>
      <div
        className={cn(
          "group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-accent",
          variant === "wide" && "flex flex-col sm:flex-row",
        )}
      >
        {combo.badge && (
          <div className="absolute top-3 left-3 z-10 bg-primary text-primary-foreground text-xs font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
            <Tag className="h-3 w-3" />
            {combo.badge}
          </div>
        )}
        <div
          className={cn(
            "relative overflow-hidden bg-muted",
            variant === "wide" ? "sm:w-2/5 h-44 sm:h-auto" : "h-40 sm:h-44",
          )}
        >
          <img
            src={combo.imageUrl}
            alt={combo.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {combo.savings && combo.savings > 0 && (
            <div className="absolute bottom-2 right-2 bg-accent text-accent-foreground text-xs font-black px-2 py-1 rounded-lg">
              −{combo.savings}₽
            </div>
          )}
        </div>
        <div
          className={cn("p-4 flex flex-col flex-1", variant === "wide" && "sm:p-5")}
        >
          <h3 className="font-extrabold text-lg sm:text-xl text-foreground leading-tight">
            {combo.name}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
            {combo.description}
          </p>
          <ul className="mt-3 space-y-1 flex-1">
            {combo.items.map((item) => (
              <li
                key={item.id}
                className="text-xs text-foreground/80 flex items-center gap-1.5"
              >
                <span className="w-1 h-1 rounded-full bg-primary shrink-0" />
                {item.quantity > 1 ? `${item.quantity}× ` : ""}
                {item.name}
              </li>
            ))}
          </ul>
          <div className="flex flex-col min-[400px]:flex-row min-[400px]:items-center justify-between mt-4 gap-2">
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-3xl font-black text-primary">
                {combo.price}₽
              </span>
              {combo.oldPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  {combo.oldPrice}₽
                </span>
              )}
            </div>
            <Button
              onClick={() => setBuilderOpen(true)}
              className="rounded-full h-10 sm:h-12 w-full min-[400px]:w-auto px-4 bg-primary hover:bg-primary/90 shadow-lg shrink-0 font-bold gap-1.5"
            >
              <Settings2 className="h-4 w-4" />
              Собрать
            </Button>
          </div>
        </div>
      </div>

      <ComboBuilderDialog
        combo={combo}
        catalog={catalog}
        open={builderOpen}
        onOpenChange={setBuilderOpen}
      />
    </>
  );
}
