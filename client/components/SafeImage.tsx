import { useState } from "react";
import { cn } from "@/lib/utils";

const FALLBACK = "/placeholder.svg";

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
}

export function SafeImage({
  src,
  alt,
  className,
  fallback = FALLBACK,
}: SafeImageProps) {
  const [current, setCurrent] = useState(src);

  return (
    <img
      src={current}
      alt={alt}
      className={cn(className)}
      onError={() => {
        if (current !== fallback) setCurrent(fallback);
      }}
      loading="lazy"
      decoding="async"
    />
  );
}
