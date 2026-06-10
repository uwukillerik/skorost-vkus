import { Router } from "express";
import { prisma } from "../lib/prisma";
import { serializeProduct } from "../lib/serializers";

const router = Router();

router.get("/", async (req, res) => {
  const { category, featured } = req.query;
  const products = await prisma.product.findMany({
    where: {
      isAvailable: true,
      ...(category
        ? { category: { slug: String(category), isActive: true } }
        : {}),
      ...(featured === "true" ? { isFeatured: true } : {}),
    },
    include: { category: true },
    orderBy: { name: "asc" },
  });
  res.json({ products: products.map(serializeProduct) });
});

router.get("/:slug", async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { slug: String(req.params.slug) },
    include: { category: true },
  });
  if (!product || !product.isAvailable) {
    res.status(404).json({ error: "Товар не найден" });
    return;
  }

  const [relatedProducts, suggestDrinks, suggestSides] = await Promise.all([
    prisma.product.findMany({
      where: {
        isAvailable: true,
        categoryId: product.categoryId,
        id: { not: product.id },
      },
      include: { category: true },
      take: 4,
    }),
    prisma.product.findMany({
      where: {
        isAvailable: true,
        category: { slug: "drinks" },
      },
      include: { category: true },
      take: 6,
      orderBy: { price: "asc" },
    }),
    prisma.product.findMany({
      where: {
        isAvailable: true,
        category: { slug: "appetizers" },
      },
      include: { category: true },
      take: 6,
      orderBy: { price: "asc" },
    }),
  ]);

  res.json({
    product: serializeProduct(product),
    relatedProducts: relatedProducts.map(serializeProduct),
    suggestDrinks: suggestDrinks.map(serializeProduct),
    suggestSides: suggestSides.map(serializeProduct),
  });
});

export default router;
