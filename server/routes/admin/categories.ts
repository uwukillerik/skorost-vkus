import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { validateBody } from "../../middleware/validate";
import { serializeCategory } from "../../lib/serializers";

const router = Router();

const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  emoji: z.string().optional(),
  description: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

router.get("/", async (_req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });
  res.json({ categories: categories.map(serializeCategory) });
});

router.post("/", validateBody(categorySchema), async (req, res) => {
  const category = await prisma.category.create({ data: req.body });
  res.status(201).json({ category: serializeCategory(category) });
});

router.patch("/:id", validateBody(categorySchema.partial()), async (req, res) => {
  const category = await prisma.category.update({
    where: { id: String(req.params.id) },
    data: req.body,
  });
  res.json({ category: serializeCategory(category) });
});

router.delete("/:id", async (req, res) => {
  await prisma.category.delete({ where: { id: String(req.params.id) } });
  res.json({ ok: true });
});

export default router;
