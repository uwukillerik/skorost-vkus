import { Router } from "express";
import { prisma } from "../lib/prisma";
import { serializeCategory } from "../lib/serializers";

const router = Router();

router.get("/", async (_req, res) => {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });
  res.json({ categories: categories.map(serializeCategory) });
});

export default router;
