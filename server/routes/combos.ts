import { Router } from "express";
import { prisma } from "../lib/prisma";
import { serializeCombo } from "../lib/serializers";

const router = Router();

router.get("/", async (_req, res) => {
  const combos = await prisma.combo.findMany({
    where: { isActive: true },
    include: { items: { include: { product: true } } },
    orderBy: { sortOrder: "asc" },
  });
  res.json({ combos: combos.map(serializeCombo) });
});

router.get("/:slug", async (req, res) => {
  const combo = await prisma.combo.findUnique({
    where: { slug: String(req.params.slug) },
    include: { items: { include: { product: true } } },
  });
  if (!combo || !combo.isActive) {
    res.status(404).json({ error: "Комбо не найдено" });
    return;
  }
  res.json({ combo: serializeCombo(combo) });
});

export default router;
