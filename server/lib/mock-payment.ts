import { randomUUID } from "crypto";

const FAIL_CARD = "4000000000000002";

export function normalizeCardNumber(raw: string): string {
  return raw.replace(/\s/g, "");
}

export function validateMockCard(cardNumber: string): {
  ok: boolean;
  error?: string;
} {
  const num = normalizeCardNumber(cardNumber);
  if (!/^\d{16}$/.test(num)) {
    return { ok: false, error: "Номер карты: 16 цифр" };
  }
  if (num === FAIL_CARD) {
    return { ok: false, error: "Недостаточно средств (демо-отказ)" };
  }
  return { ok: true };
}

export function validateExpiry(expiry: string): { ok: boolean; error?: string } {
  const m = expiry.match(/^(\d{2})\/(\d{2})$/);
  if (!m) return { ok: false, error: "Формат MM/YY" };
  const month = parseInt(m[1], 10);
  if (month < 1 || month > 12) return { ok: false, error: "Некорректный месяц" };
  return { ok: true };
}

export function validateCvv(cvv: string): { ok: boolean; error?: string } {
  if (!/^\d{3}$/.test(cvv)) return { ok: false, error: "CVV: 3 цифры" };
  return { ok: true };
}

export async function simulatePaymentDelay(ms = 1500): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}

export function generatePaymentId(): string {
  return `MOCK-${randomUUID().slice(0, 8).toUpperCase()}`;
}
