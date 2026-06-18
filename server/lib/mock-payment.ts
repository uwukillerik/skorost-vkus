import { randomUUID } from "crypto";

export {
  normalizeCardNumber,
  validateMockCard,
  validateExpiry,
  validateCvv,
} from "../../shared/payment-card";

export async function simulatePaymentDelay(ms = 1500): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}

export function generatePaymentId(): string {
  return `MOCK-${randomUUID().slice(0, 8).toUpperCase()}`;
}
