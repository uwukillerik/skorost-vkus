import type { CategoryDto } from "@shared/api";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface CategoryGridProps {
  categories: CategoryDto[];
  activeSlug?: string;
  onSelect?: (slug: string) => void;
}

/** Горизонтальные плитки категорий — компактно, как в мобильном меню сетей */
export function CategoryGrid({
  categories,
  activeSlug,
  onSelect,
}: CategoryGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      {categories.map((cat) => {
        const active = activeSlug === cat.slug;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect?.(cat.slug)}
            className={cn(
              "group flex h-[76px] sm:h-[84px] w-full overflow-hidden rounded-xl text-left",
              "bg-card border-2 shadow-sm transition-all",
              active
                ? "border-primary shadow-md ring-2 ring-primary/20"
                : "border-border/80 hover:border-primary/40 hover:shadow-md",
            )}
          >
            <div className="relative w-[88px] sm:w-[100px] shrink-0 overflow-hidden">
              {cat.imageUrl ? (
                <img
                  src={cat.imageUrl}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-primary/80 to-secondary flex items-center justify-center text-3xl">
                  {cat.emoji}
                </div>
              )}
            </div>
            <div className="flex flex-1 items-center justify-between gap-2 px-3 sm:px-4 min-w-0 bg-gradient-to-r from-card to-muted/30">
              <div className="min-w-0">
                <p className="font-bold text-sm sm:text-base text-foreground truncate flex items-center gap-1.5">
                  <span className="text-lg shrink-0">{cat.emoji}</span>
                  {cat.name}
                </p>
                {cat.description && (
                  <p className="text-[11px] sm:text-xs text-muted-foreground truncate mt-0.5">
                    {cat.description}
                  </p>
                )}
                {cat.productCount != null && (
                  <p className="text-[10px] text-primary font-semibold mt-0.5">
                    {cat.productCount} блюд
                  </p>
                )}
              </div>
              <ChevronRight
                className={cn(
                  "h-5 w-5 shrink-0 text-muted-foreground transition-transform",
                  active ? "text-primary translate-x-0.5" : "group-hover:translate-x-0.5",
                )}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}
