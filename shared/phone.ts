/** Нормализует телефон до цифр (7XXXXXXXXXX или 10 цифр без кода). */
export function phoneDigits(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("8")) {
    digits = `7${digits.slice(1)}`;
  }
  if (digits.length === 10 && digits.startsWith("9")) {
    digits = `7${digits}`;
  }
  return digits;
}

export function isValidPhone(raw: string): boolean {
  const digits = phoneDigits(raw);
  return digits.length >= 10 && digits.length <= 11;
}

export const PHONE_ERROR =
  "Укажите телефон: минимум 10 цифр (например +7 999 123-45-67)";

/** Форматирование при вводе: +7 (999) 123-45-67 */
export function formatPhoneInput(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("8")) digits = `7${digits.slice(1)}`;
  if (digits.startsWith("9") && digits.length <= 10) {
    digits = `7${digits}`;
  }
  digits = digits.slice(0, 11);

  if (digits.length === 0) return "";
  if (digits.length <= 1) return `+${digits}`;
  if (digits.length <= 4) return `+${digits[0]} (${digits.slice(1)}`;
  if (digits.length <= 7) {
    return `+${digits[0]} (${digits.slice(1, 4)}) ${digits.slice(4)}`;
  }
  if (digits.length <= 9) {
    return `+${digits[0]} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return `+${digits[0]} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`;
}

export function formatPhoneForStorage(raw: string): string {
  const digits = phoneDigits(raw);
  if (digits.length === 11 && digits.startsWith("7")) {
    return `+${digits[0]} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`;
  }
  return raw.trim();
}
