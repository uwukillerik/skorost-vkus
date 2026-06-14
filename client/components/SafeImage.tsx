import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { resolveMediaUrl } from "@/lib/media-url";

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
        if (current !== fallback) setCurrent(fallback);
      }}
      loading="lazy"
      decoding="async"
    />
  );
}
