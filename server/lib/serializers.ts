import { Decimal } from "@prisma/client/runtime/library";
import type {
  Order,
  OrderItem,
  Product,
  Category,
  User,
  Combo,
  ComboItem,
} from "@prisma/client";
import type {
  CategoryDto,
  ComboDto,
  ComboItemDto,
  OrderDto,
  OrderItemDto,
  ProductDto,
  UserPublic,
} from "@shared/api";

export function toNumber(d: Decimal | number): number {
  return typeof d === "number" ? d : Number(d);
}

export function serializeUser(user: User): UserPublic {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    role: user.role as UserPublic["role"],
    createdAt: user.createdAt.toISOString(),
    loyaltyPoints: user.loyaltyPoints,
    referralCode: user.referralCode,
  };
}

export function serializeCategory(
  cat: Category & { _count?: { products: number } },
): CategoryDto {
  return {
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    emoji: cat.emoji,
    description: cat.description,
    imageUrl: cat.imageUrl,
    sortOrder: cat.sortOrder,
    isActive: cat.isActive,
    productCount: cat._count?.products,
  };
}

export function serializeProduct(
  p: Product & { category?: Category },
): ProductDto {
  return {
    id: p.id,
    categoryId: p.categoryId,
    categorySlug: p.category?.slug,
    categoryName: p.category?.name,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: toNumber(p.price),
    imageUrl: p.imageUrl,
    isAvailable: p.isAvailable,
    isFeatured: p.isFeatured,
    calories: p.calories,
    protein: p.protein,
    weightGrams: p.weightGrams,
    ingredients: p.ingredients,
    allergens: p.allergens,
  };
}

export function serializeComboItem(
  item: ComboItem & { product?: Product | null },
): ComboItemDto {
  return {
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    productId: item.productId,
    productSlug: item.product?.slug,
  };
}

export function serializeCombo(
  combo: Combo & {
    items: (ComboItem & { product?: Product | null })[];
  },
): ComboDto {
  return {
    id: combo.id,
    name: combo.name,
    slug: combo.slug,
    description: combo.description,
    price: toNumber(combo.price),
    oldPrice: combo.oldPrice ? toNumber(combo.oldPrice) : null,
    imageUrl: combo.imageUrl,
    badge: combo.badge,
    calories: combo.calories,
    items: combo.items.map(serializeComboItem),
    savings:
      combo.oldPrice != null
        ? toNumber(combo.oldPrice) - toNumber(combo.price)
        : null,
  };
}

export function serializeOrderItem(
  item: OrderItem & { comboId?: string | null },
): OrderItemDto {
  const unitPrice = toNumber(item.unitPrice);
  return {
    id: item.id,
    productId: item.productId,
    comboId: item.comboId ?? null,
    productName: item.productName,
    quantity: item.quantity,
    unitPrice,
    subtotal: unitPrice * item.quantity,
  };
}

export type OrderWithRelations = Order & {
  items: OrderItem[];
  user?: User | null;
};

export function serializeOrder(
  order: OrderWithRelations,
  includeToken = false,
): OrderDto {
  return {
    id: order.id,
    status: order.status as OrderDto["status"],
    subtotal: toNumber(order.subtotal),
    deliveryFee: toNumber(order.deliveryFee),
    totalAmount: toNumber(order.totalAmount),
    address: order.address,
    comment: order.comment,
    pickupAt: order.pickupAt?.toISOString() ?? null,
    deliveryType: order.deliveryType as OrderDto["deliveryType"],
    paymentMethod: order.paymentMethod as OrderDto["paymentMethod"],
    paymentStatus: order.paymentStatus as OrderDto["paymentStatus"],
    paymentId: order.paymentId,
    guestName: order.guestName,
    guestPhone: order.guestPhone,
    guestEmail: order.guestEmail,
    guestAccessToken: includeToken
      ? (order.guestAccessToken ?? undefined)
      : undefined,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    items: order.items.map(serializeOrderItem),
    user: order.user ? serializeUser(order.user) : null,
  };
}
