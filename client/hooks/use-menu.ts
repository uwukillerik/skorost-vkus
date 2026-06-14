import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => api.categories.list().then((r) => r.categories),
    retry: 2,
    staleTime: 30_000,
  });
}

export function useProducts(params?: { category?: string; featured?: boolean }) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => api.products.list(params).then((r) => r.products),
    retry: 2,
    staleTime: 30_000,
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => api.products.get(slug).then((r) => r.product),
    enabled: !!slug,
  });
}

export function useProductDetail(slug: string) {
  return useQuery({
    queryKey: ["product", slug, "detail"],
    queryFn: () => api.products.getDetail(slug),
    enabled: !!slug,
  });
}

export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: () => api.orders.list().then((r) => r.orders),
  });
}

export function useOrder(id: string, params?: { token?: string; phone?: string }) {
  return useQuery({
    queryKey: ["order", id, params],
    queryFn: () => api.orders.get(id, params).then((r) => r.order),
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (!status || status === "DELIVERED" || status === "CANCELLED") {
        return false;
      }
      return 8000;
    },
  });
}

export function useCombos() {
  return useQuery({
    queryKey: ["combos"],
    queryFn: () => api.combos.list().then((r) => r.combos),
    retry: 2,
    staleTime: 30_000,
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => api.admin.stats().then((r) => r.stats),
  });
}
