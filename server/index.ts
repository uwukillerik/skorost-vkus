import "dotenv/config";
import express from "express";
import path from "node:path";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth";
import categoriesRoutes from "./routes/categories";
import productsRoutes from "./routes/products";
import combosRoutes from "./routes/combos";
import ordersRoutes from "./routes/orders";
import paymentsRoutes from "./routes/payments";
import adminCategoriesRoutes from "./routes/admin/categories";
import adminProductsRoutes from "./routes/admin/products";
import adminOrdersRoutes from "./routes/admin/orders";
import adminStatsRoutes from "./routes/admin/stats";
import adminUsersRoutes from "./routes/admin/users";
import loyaltyRoutes from "./routes/loyalty";
import notificationsRoutes from "./routes/notifications";
import { optionalAuth, requireAuth, requireAdmin } from "./middleware/auth";
import { ensureAvatarDir } from "./lib/avatar";
import { ensureAllUploadDirs } from "./lib/images";
import adminUploadsRoutes from "./routes/admin/uploads";

ensureAvatarDir();
ensureAllUploadDirs();

export function createServer() {
  const app = express();

  app.use(
    cors({
      origin: true,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "3mb" }));
  app.use(
    "/uploads",
    express.static(path.join(process.cwd(), "public", "uploads")),
  );
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(optionalAuth);

  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/categories", categoriesRoutes);
  app.use("/api/products", productsRoutes);
  app.use("/api/combos", combosRoutes);
  app.use("/api/orders", ordersRoutes);
  app.use("/api/payments", paymentsRoutes);
  app.use("/api/loyalty", loyaltyRoutes);
  app.use("/api/notifications", notificationsRoutes);

  app.use("/api/admin/categories", requireAuth, requireAdmin, adminCategoriesRoutes);
  app.use("/api/admin/products", requireAuth, requireAdmin, adminProductsRoutes);
  app.use("/api/admin/orders", requireAuth, requireAdmin, adminOrdersRoutes);
  app.use("/api/admin/stats", requireAuth, requireAdmin, adminStatsRoutes);
  app.use("/api/admin/users", requireAuth, requireAdmin, adminUsersRoutes);
  app.use("/api/admin/upload", requireAuth, requireAdmin, adminUploadsRoutes);

  app.use(
    (
      err: Error,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      console.error(err);
      res.status(500).json({ error: "Внутренняя ошибка сервера" });
    },
  );

  return app;
}
