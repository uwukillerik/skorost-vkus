import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { SafeImage } from "@/components/SafeImage";

interface BrandLogoProps {
  className?: string;
  imgClassName?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: { img: "h-9 w-9", title: "text-base", sub: "text-[10px]" },
  md: { img: "h-9 w-9 sm:h-11 sm:w-11", title: "text-base sm:text-lg", sub: "text-[10px] sm:text-xs" },
  lg: { img: "h-16 w-16 sm:h-20 sm:w-20", title: "text-xl sm:text-2xl", sub: "text-xs sm:text-sm" },
};

export function BrandLogo({
  className,
  imgClassName,
  showText = true,
  size = "md",
}: BrandLogoProps) {
  const s = sizes[size];
  return (
    <Link to="/" className={cn("flex items-center gap-2 min-w-0 group", className)}>
      <SafeImage
        src="/Logo.png"
        alt="Скорость и Вкус"
        className={cn(
          "rounded-xl object-contain drop-shadow-md transition-transform group-hover:scale-105 shrink-0",
          s.img,
          imgClassName,
        )}
      />
      {showText && (
        <div className="min-w-0 leading-tight">
          <div
            className={cn(
              "font-extrabold text-foreground tracking-tight truncate",
              s.title,
            )}
          >
            Скорость & Вкус
          </div>
          <div
            className={cn(
              "text-muted-foreground font-medium truncate hidden sm:block",
              s.sub,
            )}
          >
            Доставка за 20 минут
          </div>
        </div>
      )}
    </Link>
  );
}
