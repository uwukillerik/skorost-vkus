import { addMinutes, format, setMinutes, setSeconds, startOfDay } from "date-fns";
import { ru } from "date-fns/locale";

const OPEN_HOUR = 10;
const CLOSE_HOUR = 22;
const SLOT_MINUTES = 15;
const MIN_LEAD_MINUTES = 25;

export interface PickupSlot {
  value: string;
  label: string;
}

export function getPickupSlots(now = new Date()): PickupSlot[] {
  const earliest = addMinutes(now, MIN_LEAD_MINUTES);
  const slots: PickupSlot[] = [];
  let cursor = new Date(earliest);
  cursor.setSeconds(0, 0);
  const remainder = cursor.getMinutes() % SLOT_MINUTES;
  if (remainder !== 0) {
    cursor = addMinutes(cursor, SLOT_MINUTES - remainder);
  }

  const endOfToday = setMinutes(
    setSeconds(
      new Date(
        cursor.getFullYear(),
        cursor.getMonth(),
        cursor.getDate(),
        CLOSE_HOUR,
        0,
      ),
      0,
    ),
    0,
  );

  while (cursor <= endOfToday && slots.length < 16) {
    const hour = cursor.getHours();
    if (hour >= OPEN_HOUR && hour < CLOSE_HOUR) {
      const value = cursor.toISOString();
      const isToday =
        startOfDay(cursor).getTime() === startOfDay(now).getTime();
      const timeLabel = format(cursor, "HH:mm", { locale: ru });
      const dayLabel = isToday
        ? "Сегодня"
        : format(cursor, "d MMM", { locale: ru });
      slots.push({
        value,
        label: `${dayLabel}, ${timeLabel}`,
      });
    }
    cursor = addMinutes(cursor, SLOT_MINUTES);
  }

  return slots;
}
