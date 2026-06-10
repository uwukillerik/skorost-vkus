import type { Order } from "@prisma/client";
import { prisma } from "./prisma";
import { toNumber } from "./serializers";

export const LOYALTY_RATE = 10; // 10 ₽ = 1 корона
export const REFERRAL_BONUS_REFERRER = 500;
export const REFERRAL_BONUS_NEW_USER = 200;

export function calcOrderPoints(totalAmount: number): number {
  return Math.max(1, Math.floor(totalAmount / LOYALTY_RATE));
}

export function getLoyaltyTier(points: number): {
  id: string;
  name: string;
  nextAt: number | null;
  color: string;
} {
  if (points >= 2000) {
    return { id: "gold", name: "VIP-гость", nextAt: null, color: "#C9A227" };
  }
  if (points >= 500) {
    return {
      id: "silver",
      name: "Постоянный клиент",
      nextAt: 2000,
      color: "#8B9DAF",
    };
  }
  return {
    id: "bronze",
    name: "Новичок",
    nextAt: 500,
    color: "#B87333",
  };
}

export async function awardOrderLoyalty(order: Order): Promise<void> {
  if (!order.userId || order.loyaltyPointsAwarded) return;

  const points = calcOrderPoints(toNumber(order.totalAmount));
  await prisma.$transaction([
    prisma.user.update({
      where: { id: order.userId },
      data: { loyaltyPoints: { increment: points } },
    }),
    prisma.order.update({
      where: { id: order.id },
      data: { loyaltyPointsAwarded: true },
    }),
  ]);
}
