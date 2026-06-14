import type {
  AdminStatsDto,
  AdminUserDto,
  AuthResponse,
  CategoryDto,
  ComboDto,
  CreateOrderResponse,
  DeliveryType,
  LoyaltyDto,
  OrderDto,
  PayOrderRequest,
  PayOrderResponse,
  PaymentMethod,
  ProductDto,
  UserPublic,
} from "@shared/api";

import { getApiBase } from "@/lib/api-base";

const BASE = getApiBase();

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const details = data.details as Record<string, string[] | undefined> | undefined;
    const detailText = details
      ? Object.values(details)
          .flat()
          .filter((line): line is string => Boolean(line))
          .join(". ")
      : "";
    const message =
      detailText || data.error || `Ошибка ${res.status}`;
    throw new Error(message);
  }
  return data as T;
}

export const api = {
  auth: {
    register: (body: {
      email: string;
      password: string;
      name: string;
      phone?: string;
      referralCode?: string;
    }) =>
      request<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    login: (body: { email: string; password: string }) =>
      request<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    logout: () => request<{ ok: boolean }>("/auth/logout", { method: "POST" }),
    me: () => request<{ user: UserPublic }>("/auth/me"),
    updateProfile: (body: {
      name?: string;
      phone?: string | null;
      currentPassword?: string;
      newPassword?: string;
    }) =>
      request<AuthResponse>("/auth/profile", {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    uploadAvatar: (image: string) =>
      request<AuthResponse>("/auth/avatar", {
        method: "POST",
        body: JSON.stringify({ image }),
      }),
    deleteAvatar: () =>
      request<AuthResponse>("/auth/avatar", { method: "DELETE" }),
  },
  categories: {
    list: () => request<{ categories: CategoryDto[] }>("/categories"),
  },
  combos: {
    list: () => request<{ combos: ComboDto[] }>("/combos"),
    get: (slug: string) =>
      request<{ combo: ComboDto }>(`/combos/${slug}`),
  },
  products: {
    list: (params?: { category?: string; featured?: boolean }) => {
      const q = new URLSearchParams();
      if (params?.category) q.set("category", params.category);
      if (params?.featured) q.set("featured", "true");
      const qs = q.toString();
      return request<{ products: ProductDto[] }>(
        `/products${qs ? `?${qs}` : ""}`,
      );
    },
    get: (slug: string) =>
      request<{ product: ProductDto }>(`/products/${slug}`),
    getDetail: (slug: string) =>
      request<{
        product: ProductDto;
        relatedProducts: ProductDto[];
        suggestDrinks: ProductDto[];
        suggestSides: ProductDto[];
      }>(`/products/${slug}`),
  },
  loyalty: {
    get: () => request<{ loyalty: LoyaltyDto }>("/loyalty"),
  },
  orders: {
    list: () => request<{ orders: OrderDto[] }>("/orders"),
    get: (id: string, params?: { token?: string; phone?: string }) => {
      const q = new URLSearchParams();
      if (params?.token) q.set("token", params.token);
      if (params?.phone) q.set("phone", params.phone);
      const qs = q.toString();
      return request<{ order: OrderDto }>(
        `/orders/${id}${qs ? `?${qs}` : ""}`,
      );
    },
    create: (body: {
      items: { productId: string; quantity: number }[];
      combos?: { comboId: string; quantity: number }[];
      address: string;
      comment?: string;
      deliveryType: DeliveryType;
      pickupAt?: string;
      paymentMethod: PaymentMethod;
      guestName?: string;
      guestPhone?: string;
      guestEmail?: string;
    }) =>
      request<CreateOrderResponse>("/orders", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  },
  payments: {
    pay: (orderId: string, body: PayOrderRequest, token?: string) => {
      const q = token ? `?token=${encodeURIComponent(token)}` : "";
      return request<PayOrderResponse>(`/payments/orders/${orderId}/pay${q}`, {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
  },
  notifications: {
    vapidPublicKey: () =>
      request<{ publicKey: string | null }>("/notifications/vapid-public-key"),
    subscribe: (body: {
      endpoint: string;
      keys: { p256dh: string; auth: string };
      orderId?: string;
      orderAccessToken?: string;
    }) =>
      request<{ ok: boolean }>("/notifications/subscribe", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  },
  admin: {
    stats: () => request<{ stats: AdminStatsDto }>("/admin/stats"),
    upload: (image: string, folder: "products" | "categories" | "combos") =>
      request<{ url: string }>("/admin/upload", {
        method: "POST",
        body: JSON.stringify({ image, folder }),
      }),
    categories: {
      list: () =>
        request<{ categories: CategoryDto[] }>("/admin/categories"),
      create: (body: Partial<CategoryDto>) =>
        request<{ category: CategoryDto }>("/admin/categories", {
          method: "POST",
          body: JSON.stringify(body),
        }),
      update: (id: string, body: Partial<CategoryDto>) =>
        request<{ category: CategoryDto }>(`/admin/categories/${id}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        }),
      delete: (id: string) =>
        request<{ ok: boolean }>(`/admin/categories/${id}`, {
          method: "DELETE",
        }),
    },
    products: {
      list: (categoryId?: string) => {
        const q = categoryId ? `?categoryId=${categoryId}` : "";
        return request<{ products: ProductDto[] }>(`/admin/products${q}`);
      },
      create: (body: Record<string, unknown>) =>
        request<{ product: ProductDto }>("/admin/products", {
          method: "POST",
          body: JSON.stringify(body),
        }),
      update: (id: string, body: Record<string, unknown>) =>
        request<{ product: ProductDto }>(`/admin/products/${id}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        }),
      delete: (id: string) =>
        request<{ ok: boolean }>(`/admin/products/${id}`, {
          method: "DELETE",
        }),
    },
    orders: {
      list: (status?: string) => {
        const q = status ? `?status=${status}` : "";
        return request<{ orders: OrderDto[] }>(`/admin/orders${q}`);
      },
      get: (id: string) =>
        request<{ order: OrderDto }>(`/admin/orders/${id}`),
      updateStatus: (id: string, status: string) =>
        request<{ order: OrderDto }>(`/admin/orders/${id}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status }),
        }),
    },
    users: {
      list: () => request<{ users: AdminUserDto[] }>("/admin/users"),
    },
  },
};
