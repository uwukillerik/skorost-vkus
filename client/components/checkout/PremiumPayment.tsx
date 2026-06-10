import {
  CreditCard,
  Smartphone,
  Banknote,
  Loader2,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { PaymentMethod } from "@shared/api";
import { PAYMENT_METHOD_LABELS } from "@/lib/payment-labels";

const methods: {
  id: PaymentMethod;
  icon: typeof CreditCard;
  desc: string;
  brands?: string;
}[] = [
  { id: "CARD", icon: CreditCard, desc: "Visa · Mastercard · Мир", brands: "💳" },
  { id: "SBP", icon: Smartphone, desc: "Мгновенный перевод", brands: "⚡" },
  { id: "CASH", icon: Banknote, desc: "Курьеру или на кассе", brands: "💵" },
];

interface PremiumPaymentProps {
  method: PaymentMethod;
  onMethodChange: (m: PaymentMethod) => void;
  lockMethod?: boolean;
  card: { number: string; expiry: string; cvv: string; holder: string };
  onCardChange: (c: PremiumPaymentProps["card"]) => void;
  onPay: () => void;
  loading: boolean;
  total: number;
}

export function PremiumPayment({
  method,
  onMethodChange,
  lockMethod = false,
  card,
  onCardChange,
  onPay,
  loading,
  total,
}: PremiumPaymentProps) {
  const formatCard = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 16);
    return d.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  };

  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    if (d.length <= 2) return d;
    return `${d.slice(0, 2)}/${d.slice(2)}`;
  };

  const cardDigits = card.number.replace(/\s/g, "");
  const maskedPreview =
    cardDigits.length > 0
      ? card.number.padEnd(19, "•").slice(0, 19)
      : "•••• •••• •••• ••••";

  return (
    <div className="space-y-6">
      {!lockMethod && (
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {methods.map((m) => {
            const Icon = m.icon;
            const sel = method === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onMethodChange(m.id)}
                className={cn(
                  "relative p-3 sm:p-4 rounded-2xl border-2 text-center transition-all",
                  sel
                    ? "border-primary bg-primary text-primary-foreground shadow-lg scale-[1.02]"
                    : "border-border bg-white hover:border-primary/50",
                )}
              >
                <Icon className={cn("h-6 w-6 mx-auto mb-1", sel && "text-accent")} />
                <p className="text-[10px] sm:text-xs font-bold leading-tight">
                  {PAYMENT_METHOD_LABELS[m.id].split(" ")[0]}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {method === "CARD" && (
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-[1.6/1] max-h-52 sm:max-h-none">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary via-primary to-red-800" />
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_80%_20%,#FFC72C_0%,transparent_50%)]" />
            <div className="relative p-5 sm:p-6 h-full flex flex-col justify-between text-white">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold tracking-widest opacity-80">
                  SKOROST PAY
                </span>
                <div className="flex gap-1">
                  <span className="w-8 h-5 rounded bg-white/20" />
                  <span className="w-8 h-5 rounded bg-accent/80" />
                </div>
              </div>
              <p className="font-mono text-lg sm:text-xl tracking-widest mt-4">
                {maskedPreview}
              </p>
              <div className="flex justify-between items-end mt-auto pt-4">
                <div>
                  <p className="text-[9px] uppercase opacity-60">Держатель</p>
                  <p className="text-sm font-semibold uppercase truncate max-w-[140px]">
                    {card.holder || "YOUR NAME"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] uppercase opacity-60">Срок</p>
                  <p className="text-sm font-semibold">{card.expiry || "MM/YY"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">
                Номер карты
              </Label>
              <Input
                className="h-12 text-lg font-mono mt-1 border-2 focus:border-primary"
                placeholder="4242 4242 4242 4242"
                value={card.number}
                onChange={(e) =>
                  onCardChange({ ...card, number: formatCard(e.target.value) })
                }
                inputMode="numeric"
              />
            </div>
            <div>
              <Label className="text-xs font-bold uppercase text-muted-foreground">
                MM/YY
              </Label>
              <Input
                className="h-12 font-mono mt-1 border-2"
                placeholder="12/28"
                value={card.expiry}
                onChange={(e) =>
                  onCardChange({
                    ...card,
                    expiry: formatExpiry(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <Label className="text-xs font-bold uppercase text-muted-foreground">
                CVV
              </Label>
              <Input
                className="h-12 font-mono mt-1 border-2"
                placeholder="•••"
                type="password"
                maxLength={3}
                value={card.cvv}
                onChange={(e) =>
                  onCardChange({
                    ...card,
                    cvv: e.target.value.replace(/\D/g, "").slice(0, 3),
                  })
                }
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">
                Имя на карте
              </Label>
              <Input
                className="h-12 mt-1 border-2 uppercase"
                placeholder="IVAN IVANOV"
                value={card.holder}
                onChange={(e) =>
                  onCardChange({ ...card, holder: e.target.value.toUpperCase() })
                }
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-2 bg-muted/50 rounded-lg p-3">
            <ShieldCheck className="h-4 w-4 text-green-600 shrink-0" />
            Демо: любая карта кроме 4000 0000 0000 0002. Данные не сохраняются.
          </p>
        </div>
      )}

      {method === "SBP" && (
        <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-6 sm:p-8 text-white text-center shadow-xl">
          <div className="w-20 h-20 mx-auto bg-white rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Smartphone className="h-10 w-10 text-indigo-600" />
          </div>
          <p className="text-xl font-bold">Оплата через СБП</p>
          <p className="text-sm text-white/80 mt-2 max-w-xs mx-auto">
            Нажмите кнопку ниже — имитация подтверждения в приложении банка
          </p>
          <div className="mt-6 inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 text-sm">
            <Lock className="h-4 w-4" />
            Безопасное соединение
          </div>
        </div>
      )}

      {method === "CASH" && (
        <div className="rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-6 sm:p-8 text-center shadow-xl text-amber-950">
          <Banknote className="h-16 w-16 mx-auto mb-4 opacity-90" />
          <p className="text-2xl font-black">Оплата при получении</p>
          <p className="text-sm mt-2 opacity-90 max-w-sm mx-auto">
            Подготовьте сумму {total}₽ наличными или оплатите картой курьеру
          </p>
        </div>
      )}

      <Button
        size="lg"
        className="w-full h-14 text-lg font-black bg-accent hover:bg-accent/90 text-secondary shadow-lg rounded-2xl"
        onClick={onPay}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="h-6 w-6 mr-2 animate-spin" />
            Обработка платежа...
          </>
        ) : method === "CASH" ? (
          `Подтвердить · ${total}₽`
        ) : (
          `Оплатить ${total}₽`
        )}
      </Button>
    </div>
  );
}
