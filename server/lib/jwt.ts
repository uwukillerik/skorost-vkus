import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const COOKIE_NAME = "auth_token";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export function getCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: MAX_AGE_MS,
    path: "/",
  };
}

export { COOKIE_NAME };
