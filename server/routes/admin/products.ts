import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { validateBody } from "../../middleware/validate";
import { serializeProduct } from "../../lib/serializers";

const router = Router();

const productSchema = z.object({
  categoryId: z.string(),
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  description: z.string().min(1),
  price: z.number().positive(),
  imageUrl: z.string().url(),
  isAvailable: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  calories: z.number().int().optional().nullable(),
});

router.get("/", async (req, res) => {
  const { categoryId } = req.query;
  const products = await prisma.product.findMany({
    where: categoryId ? { categoryId: String(categoryId) } : undefined,
    include: { category: true },
    orderBy: { name: "asc" },
  });
  res.json({ products: products.map(serializeProduct) });
});

router.post("/", validateBody(productSchema), async (req, res) => {
  const { price, ...rest } = req.body;
  const product = await prisma.product.create({
    data: { ...rest, price },
    include: { category: true },
  });
  res.status(201).json({ product: serializeProduct(product) });
});

router.patch("/:id", validateBody(productSchema.partial()), async (req, res) => {
  const product = await prisma.product.update({
    where: { id: String(req.params.id) },
    data: req.body,
    include: { category: true },
  });
  res.json({ product: serializeProduct(product) });
});

router.delete("/:id", async (req, res) => {
  await prisma.product.delete({ where: { id: String(req.params.id) } });
  res.json({ ok: true });
});

export default router;
