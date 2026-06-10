import {
  CreditCard,
  Smartphone,
  Banknote,
  Loader2,
  ShieldCheck,
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
}[] = [
  { id: "CARD", icon: CreditCard, desc: "Visa, Mastercard, Мир" },
  { id: "SBP", icon: Smartphone, desc: "Быстрый перевод" },
  { id: "CASH", icon: Banknote, desc: "Курьеру или на кассе" },
];

interface PaymentFormProps {
  method: PaymentMethod;
  onMethodChange: (m: PaymentMethod) => void;
  lockMethod?: boolean;
  card: { number: string; expiry: string; cvv: string; holder: string };
  onCardChange: (c: PaymentFormProps["card"]) => void;
  onPay: () => void;
  loading: boolean;
  total: number;
}

export function PaymentMethodPicker({
  method,
  onMethodChange,
}: {
  method: PaymentMethod;
  onMethodChange: (m: PaymentMethod) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {methods.map((m) => {
        const Icon = m.icon;
        const selected = method === m.id;
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onMethodChange(m.id)}
            className={cn(
              "p-4 rounded-xl border-2 text-left transition-all",
              selected
                ? "border-primary bg-primary/5 shadow-md"
                : "border-border hover:border-primary/40",
            )}
          >
            <Icon
              className={cn(
                "h-6 w-6 mb-2",
                selected ? "text-primary" : "text-muted-foreground",
              )}
            />
            <p className="font-semibold text-sm">
              {PAYMENT_METHOD_LABELS[m.id]}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{m.desc}</p>
          </button>
        );
      })}
    </div>
  );
}

export function PaymentForm({
  method,
  onMethodChange,
  lockMethod = false,
  card,
  onCardChange,
  onPay,
  loading,
  total,
}: PaymentFormProps) {
  const formatCard = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 16);
    return d.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  };

  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    if (d.length <= 2) return d;
    return `${d.slice(0, 2)}/${d.slice(2)}`;
  };

  return (
    <div className="space-y-6">
      {!lockMethod && (
        <PaymentMethodPicker method={method} onMethodChange={onMethodChange} />
      )}

      {method === "CARD" && (
        <div className="space-y-4 p-4 rounded-xl border bg-card">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <ShieldCheck className="h-4 w-4 text-green-600" />
            Демо-оплата. Успех: любая карта кроме 4000 0000 0000 0002
          </div>
          <div>
            <Label>Номер карты</Label>
            <Input
              placeholder="4242 4242 4242 4242"
              value={card.number}
              onChange={(e) =>
                onCardChange({ ...card, number: formatCard(e.target.value) })
              }
              inputMode="numeric"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Срок</Label>
              <Input
                placeholder="MM/YY"
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
              <Label>CVV</Label>
              <Input
                placeholder="123"
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
          </div>
          <div>
            <Label>Имя на карте</Label>
            <Input
              placeholder="IVAN IVANOV"
              value={card.holder}
              onChange={(e) =>
                onCardChange({ ...card, holder: e.target.value.toUpperCase() })
              }
            />
          </div>
        </div>
      )}

      {method === "SBP" && (
        <div className="p-6 rounded-xl border bg-card text-center">
          <Smartphone className="h-12 w-12 mx-auto text-primary mb-3" />
          <p className="font-medium">Оплата через СБП</p>
          <p className="text-sm text-muted-foreground mt-1">
            После нажатия откроется демо-подтверждение платежа
          </p>
        </div>
      )}

      {method === "CASH" && (
        <div className="p-6 rounded-xl border bg-amber-50 text-center">
          <Banknote className="h-12 w-12 mx-auto text-amber-700 mb-3" />
          <p className="font-medium text-amber-900">Оплата при получении</p>
          <p className="text-sm text-amber-800/80 mt-1">
            Онлайн-оплата не требуется. Заказ сразу передаётся на кухню.
          </p>
        </div>
      )}

      <Button
        className="w-full h-12 bg-accent text-accent-foreground font-bold text-base"
        onClick={onPay}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Обработка...
          </>
        ) : method === "CASH" ? (
          `Подтвердить заказ · ${total}₽`
        ) : (
          `Оплатить ${total}₽`
        )}
      </Button>
    </div>
  );
}
