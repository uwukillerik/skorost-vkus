export type UserRole = "USER" | "ADMIN";

export type OrderStatus =
  | "NEW"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentMethod = "CARD" | "SBP" | "CASH";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED";
export type DeliveryType = "DELIVERY" | "PICKUP";

export interface UserPublic {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  avatarUrl?: string | null;
  role: UserRole;
  loyaltyPoints?: number;
  referralCode?: string;
  createdAt?: string;
}

export interface LoyaltyDto {
  points: number;
  tier: string;
  tierName: string;
  tierColor: string;
  nextTierAt: number | null;
  pointsToNext: number;
  rateLabel: string;
  referralCode: string;
  referralCount: number;
  referralBonusYou: number;
  referralBonusFriend: number;
  history: {
    id: string;
    label: string;
    points: number;
    date: string;
    type: "earn";
  }[];
}

export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  emoji: string;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
  productCount?: number;
}

export interface ComboItemDto {
  id: string;
  name: string;
  quantity: number;
  productId: string | null;
  productSlug?: string | null;
}

export interface ComboDto {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  oldPrice: number | null;
  imageUrl: string;
  badge: string | null;
  calories: number | null;
  items: ComboItemDto[];
  savings: number | null;
}

export interface ProductDto {
  id: string;
  categoryId: string;
  categorySlug?: string;
  categoryName?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
  isFeatured: boolean;
  calories: number | null;
  protein?: number | null;
  weightGrams?: number | null;
  ingredients?: string | null;
  allergens?: string | null;
}

export interface ProductDetailDto extends ProductDto {
  suggestDrinks: ProductDto[];
  suggestSides: ProductDto[];
  relatedProducts: ProductDto[];
}

export interface OrderItemDto {
  id: string;
  productId: string;
  comboId?: string | null;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderDto {
  id: string;
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  address: string;
  comment: string | null;
  pickupAt?: string | null;
  deliveryType: DeliveryType;
  paymentMethod: PaymentMethod | null;
  paymentStatus: PaymentStatus;
  paymentId: string | null;
  guestName: string | null;
  guestPhone: string | null;
  guestEmail: string | null;
  guestAccessToken?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItemDto[];
  user?: UserPublic | null;
}

export interface PayOrderRequest {
  cardNumber?: string;
  expiry?: string;
  cvv?: string;
  cardHolder?: string;
}

export interface PayOrderResponse {
  success: boolean;
  order: OrderDto;
  message: string;
}

export interface AdminStatsDto {
  totalOrders: number;
  totalRevenue: number;
  paidOrders: number;
  pendingPayments: number;
  ordersByStatus: Record<OrderStatus, number>;
  recentOrders: OrderDto[];
}

export interface AdminUserDto extends UserPublic {
  orderCount: number;
  createdAt: string;
}

export interface ApiError {
  error: string;
  details?: Record<string, string[] | undefined>;
}

export interface AuthResponse {
  user: UserPublic;
}

export interface CreateOrderResponse {
  order: OrderDto;
  guestAccessToken?: string;
  requiresPayment?: boolean;
}
