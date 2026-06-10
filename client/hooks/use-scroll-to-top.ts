import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function useScrollToTopOnNavigate() {
  const { pathname } = useLocation();

  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);
}

export function scrollToElement(
  el: HTMLElement | null,
  behavior: ScrollBehavior = "smooth",
) {
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 88;
  window.scrollTo({ top: Math.max(0, top), behavior });
}
