import { RequestHandler } from "express";
import { COOKIE_NAME, verifyToken } from "../lib/jwt";
import { prisma } from "../lib/prisma";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const optionalAuth: RequestHandler = async (req, _res, next) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return next();
  const payload = verifyToken(token);
  if (!payload) return next();
  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (user) {
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
    };
  }
  next();
};

export const requireAuth: RequestHandler = async (req, res, next) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) {
    res.status(401).json({ error: "Требуется авторизация" });
    return;
  }
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: "Недействительный токен" });
    return;
  }
  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) {
    res.status(401).json({ error: "Пользователь не найден" });
    return;
  }
  req.user = {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    role: user.role,
  };
  next();
};

export const requireAdmin: RequestHandler = (req, res, next) => {
  if (!req.user || req.user.role !== "ADMIN") {
    res.status(403).json({ error: "Доступ запрещён" });
    return;
  }
  next();
};
