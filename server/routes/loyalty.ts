import { Router } from "express";
import { PaymentStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import {
  calcOrderPoints,
  getLoyaltyTier,
  LOYALTY_RATE,
  REFERRAL_BONUS_NEW_USER,
  REFERRAL_BONUS_REFERRER,
} from "../lib/loyalty";
import { toNumber } from "../lib/serializers";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: req.user!.id },
  });

  const paidOrders = await prisma.order.findMany({
    where: { userId: user.id, paymentStatus: PaymentStatus.PAID },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  const history = paidOrders.map((o) => ({
    id: o.id,
    label: `Заказ #${o.id.slice(-6)}`,
    points: calcOrderPoints(toNumber(o.totalAmount)),
    date: o.createdAt.toISOString(),
    type: "earn" as const,
  }));

  const tier = getLoyaltyTier(user.loyaltyPoints);

  res.json({
    loyalty: {
      points: user.loyaltyPoints,
      tier: tier.id,
      tierName: tier.name,
      tierColor: tier.color,
      nextTierAt: tier.nextAt,
      pointsToNext: tier.nextAt
        ? Math.max(0, tier.nextAt - user.loyaltyPoints)
        : 0,
      rateLabel: `${LOYALTY_RATE} ₽ = 1 корона`,
      referralCode: user.referralCode ?? "",
      referralCount: user.referralCount,
      referralBonusYou: REFERRAL_BONUS_REFERRER,
      referralBonusFriend: REFERRAL_BONUS_NEW_USER,
      history,
    },
  });
});

export default router;
