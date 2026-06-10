import { Router } from "express";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { serializeOrder } from "../../lib/serializers";
import type { AdminStatsDto, OrderStatus as OrderStatusDto } from "@shared/api";

const router = Router();

router.get("/", async (_req, res) => {
  const [totalOrders, revenueAgg, paidOrders, pendingPayments, statusGroups, recentOrders] =
    await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          status: { not: OrderStatus.CANCELLED },
          paymentStatus: PaymentStatus.PAID,
        },
      }),
      prisma.order.count({ where: { paymentStatus: PaymentStatus.PAID } }),
      prisma.order.count({ where: { paymentStatus: PaymentStatus.PENDING } }),
      prisma.order.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { items: true, user: true },
      }),
    ]);

  const ordersByStatus = {
    NEW: 0,
    CONFIRMED: 0,
    PREPARING: 0,
    READY: 0,
    DELIVERED: 0,
    CANCELLED: 0,
  } as Record<OrderStatusDto, number>;

  for (const g of statusGroups) {
    ordersByStatus[g.status as OrderStatusDto] = g._count.id;
  }

  const stats: AdminStatsDto = {
    totalOrders,
    totalRevenue: Number(revenueAgg._sum.totalAmount ?? 0),
    paidOrders,
    pendingPayments,
    ordersByStatus,
    recentOrders: recentOrders.map((o) => serializeOrder(o)),
  };

  res.json({ stats });
});

export default router;
