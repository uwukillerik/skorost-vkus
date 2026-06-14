import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { IMAGE_PLACEHOLDER_URL } from "@/lib/brand-assets";
import {
  resolveMediaUrl,
  resolveMediaUrlFallback,
} from "@/lib/media-url";

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
  fallback = IMAGE_PLACEHOLDER_URL,
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
      referrerPolicy="no-referrer"
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
