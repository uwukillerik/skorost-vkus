import type { CategoryDto } from "@shared/api";
import { cn } from "@/lib/utils";

interface CategoryStripProps {
  categories: CategoryDto[];
  activeSlug: string;
  onSelect: (slug: string) => void;
}

export function CategoryStrip({
  categories,
  activeSlug,
  onSelect,
}: CategoryStripProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.slug)}
          className={cn(
            "flex-shrink-0 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full font-semibold text-xs sm:text-sm transition-all flex items-center gap-1.5 sm:gap-2",
            activeSlug === cat.slug
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-card text-foreground border border-border hover:border-primary/40",
          )}
        >
          <span className="text-lg">{cat.emoji}</span>
          {cat.name}
        </button>
      ))}
    </div>
  );
}
