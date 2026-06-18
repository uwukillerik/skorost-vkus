export interface CardForm {
  number: string;
  expiry: string;
  cvv: string;
  holder: string;
}

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
  if (!m) return { ok: false, error: "Срок карты: формат MM/YY" };
  const month = parseInt(m[1], 10);
  if (month < 1 || month > 12) return { ok: false, error: "Некорректный месяц" };
  return { ok: true };
}

export function validateCvv(cvv: string): { ok: boolean; error?: string } {
  if (!/^\d{3}$/.test(cvv)) return { ok: false, error: "CVV: 3 цифры" };
  return { ok: true };
}

export function validateCardForm(card: CardForm): string | null {
  const cardCheck = validateMockCard(card.number);
  if (!cardCheck.ok) return cardCheck.error ?? "Проверьте номер карты";
  const expCheck = validateExpiry(card.expiry);
  if (!expCheck.ok) return expCheck.error ?? "Проверьте срок карты";
  const cvvCheck = validateCvv(card.cvv);
  if (!cvvCheck.ok) return cvvCheck.error ?? "Проверьте CVV";
  if (!card.holder.trim()) return "Укажите имя на карте";
  return null;
}
