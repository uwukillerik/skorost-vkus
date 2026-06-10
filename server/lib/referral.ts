import { randomBytes } from "crypto";
import { prisma } from "./prisma";

export function generateReferralCode(): string {
  return `SV${randomBytes(3).toString("hex").toUpperCase()}`;
}

export async function createUniqueReferralCode(): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const code = generateReferralCode();
    const exists = await prisma.user.findUnique({ where: { referralCode: code } });
    if (!exists) return code;
  }
  return `SV${Date.now().toString(36).toUpperCase().slice(-6)}`;
}
