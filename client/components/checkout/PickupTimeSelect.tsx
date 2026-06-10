import { useMemo } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Clock, MapPin, Sparkles } from "lucide-react";
import { getPickupSlots, type PickupSlot } from "@/lib/pickup-slots";
import { cn } from "@/lib/utils";

interface PickupTimeSelectProps {
  value: string;
  onChange: (iso: string) => void;
}

function groupSlots(slots: PickupSlot[]) {
  const groups: { title: string; slots: PickupSlot[] }[] = [];
  for (const slot of slots) {
    const day = slot.label.split(",")[0]?.trim() ?? "Сегодня";
    const existing = groups.find((g) => g.title === day);
    if (existing) existing.slots.push(slot);
    else groups.push({ title: day, slots: [slot] });
  }
  return groups;
}

export function PickupTimeSelect({ value, onChange }: PickupTimeSelectProps) {
  const slots = useMemo(() => getPickupSlots(), []);
  const groups = useMemo(() => groupSlots(slots), [slots]);
  const selected = value || slots[0]?.value;

  if (slots.length === 0) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Сегодня слоты закончились. Попробуйте завтра с 10:00.
      </div>
    );
  }

  const selectedLabel = slots.find((s) => s.value === selected)?.label;

  return (
    <div className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-card to-orange-500/5 p-4 sm:p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="h-11 w-11 rounded-xl bg-primary flex items-center justify-center shrink-0">
          <Clock className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <p className="font-extrabold text-base flex items-center gap-2">
            Когда забрать заказ?
            <Sparkles className="h-4 w-4 text-primary" />
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            ул. Тверская, 1 · слоты каждые 15 мин
          </p>
        </div>
      </div>

      {selectedLabel && (
        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-primary text-primary-foreground">
          <span className="text-sm font-semibold opacity-90">Выбрано</span>
          <span className="font-black text-lg">
            {format(new Date(selected), "HH:mm", { locale: ru })}
            <span className="text-sm font-semibold opacity-80 ml-2">
              {selectedLabel.split(",")[0]}
            </span>
          </span>
        </div>
      )}

      <div className="space-y-4 max-h-56 overflow-y-auto pr-1">
        {groups.map((group) => (
          <div key={group.title}>
            <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2 tracking-wide">
              {group.title}
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {group.slots.map((slot) => {
                const timeOnly = slot.label.split(", ").pop() ?? slot.label;
                const active = slot.value === selected;
                return (
                  <button
                    key={slot.value}
                    type="button"
                    onClick={() => onChange(slot.value)}
                    className={cn(
                      "py-2.5 px-2 rounded-xl text-sm font-bold border-2 transition-all",
                      active
                        ? "border-primary bg-primary text-primary-foreground shadow-md scale-[1.02]"
                        : "border-border bg-card hover:border-primary/40 text-foreground",
                    )}
                  >
                    {timeOnly}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-center text-muted-foreground">
        Минимум через 25 минут · кухня начнёт готовить к выбранному времени
      </p>
    </div>
  );
}
