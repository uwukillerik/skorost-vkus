import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  resolveMediaUrl,
  resolveMediaUrlFallback,
} from "@/lib/media-url";

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
  const resolved = resolveMediaUrl(src);
  const [current, setCurrent] = useState(resolved);

  useEffect(() => {
    setCurrent(resolveMediaUrl(src));
  }, [src]);

  return (
    <img
      src={current}
      alt={alt}
      className={cn(className)}
      onError={() => {
        const next = resolveMediaUrlFallback(src, current);
        if (next && next !== current) {
          setCurrent(next);
          return;
        }
        const fb = resolveMediaUrl(fallback);
        if (current !== fb) setCurrent(fb);
      }}
      loading="lazy"
      decoding="async"
    />
  );
}
