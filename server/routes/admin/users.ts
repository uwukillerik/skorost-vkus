import { Router } from "express";
import { prisma } from "../../lib/prisma";
import { serializeUser } from "../../lib/serializers";

const router = Router();

router.get("/", async (_req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });
  res.json({
    users: users.map((u) => ({
      ...serializeUser(u),
      orderCount: u._count.orders,
      createdAt: u.createdAt.toISOString(),
    })),
  });
});

export default router;
