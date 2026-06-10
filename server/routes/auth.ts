import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import {
  COOKIE_NAME,
  getCookieOptions,
  signToken,
} from "../lib/jwt";
import { validateBody } from "../middleware/validate";
import { requireAuth } from "../middleware/auth";
import { serializeUser } from "../lib/serializers";
import { createUniqueReferralCode } from "../lib/referral";
import {
  REFERRAL_BONUS_NEW_USER,
  REFERRAL_BONUS_REFERRER,
} from "../lib/loyalty";
import { deleteUserAvatar, saveUserAvatar } from "../lib/avatar";

const router = Router();

const registerSchema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(6, "Минимум 6 символов"),
  name: z.string().min(2, "Введите имя"),
  phone: z.string().optional(),
  referralCode: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const profileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional().nullable(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
});

const avatarSchema = z.object({
  image: z.string().min(100, "Некорректное изображение"),
});

router.post("/register", validateBody(registerSchema), async (req, res) => {
  const { email, password, name, phone, referralCode } = req.body;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ error: "Email уже зарегистрирован" });
    return;
  }

  let referredById: string | undefined;
  if (referralCode?.trim()) {
    const referrer = await prisma.user.findFirst({
      where: {
        referralCode: referralCode.trim().toUpperCase(),
        role: "USER",
      },
    });
    if (referrer) referredById = referrer.id;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const code = await createUniqueReferralCode();
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      phone: phone || null,
      referralCode: code,
      referredById,
      loyaltyPoints: referredById ? REFERRAL_BONUS_NEW_USER : 0,
    },
  });

  if (referredById) {
    await prisma.user.update({
      where: { id: referredById },
      data: {
        referralCount: { increment: 1 },
        loyaltyPoints: { increment: REFERRAL_BONUS_REFERRER },
      },
    });
  }
  const token = signToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });
  res.cookie(COOKIE_NAME, token, getCookieOptions());
  res.status(201).json({ user: serializeUser(user) });
});

router.post("/login", validateBody(loginSchema), async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ error: "Неверный email или пароль" });
    return;
  }
  const token = signToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });
  res.cookie(COOKIE_NAME, token, getCookieOptions());
  res.json({ user: serializeUser(user) });
});

router.post("/logout", (_req, res) => {
  res.clearCookie(COOKIE_NAME, { path: "/" });
  res.json({ ok: true });
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: req.user!.id },
  });
  res.json({ user: serializeUser(user) });
});

router.post(
  "/avatar",
  requireAuth,
  validateBody(avatarSchema),
  async (req, res) => {
    const userId = req.user!.id;
    const url = saveUserAvatar(userId, req.body.image);
    if (!url) {
      res.status(400).json({
        error: "Допустимы JPG, PNG или WebP до 2 МБ",
      });
      return;
    }
    const versioned = `${url}?v=${Date.now()}`;
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: versioned },
    });
    res.json({ user: serializeUser(updated) });
  },
);

router.delete("/avatar", requireAuth, async (req, res) => {
  const userId = req.user!.id;
  deleteUserAvatar(userId);
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl: null },
  });
  res.json({ user: serializeUser(updated) });
});

router.patch("/profile", requireAuth, validateBody(profileSchema), async (req, res) => {
  const { name, phone, currentPassword, newPassword } = req.body;
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: req.user!.id },
  });

  const data: { name?: string; phone?: string | null; passwordHash?: string } =
    {};
  if (name !== undefined) data.name = name;
  if (phone !== undefined) data.phone = phone;

  if (newPassword) {
    if (!currentPassword) {
      res.status(400).json({ error: "Укажите текущий пароль" });
      return;
    }
    if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
      res.status(400).json({ error: "Неверный текущий пароль" });
      return;
    }
    data.passwordHash = await bcrypt.hash(newPassword, 10);
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data,
  });
  res.json({ user: serializeUser(updated) });
});

export default router;
