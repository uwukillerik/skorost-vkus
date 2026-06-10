import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const steps = [
  { id: 1, label: "Доставка" },
  { id: 2, label: "Оплата" },
  { id: 3, label: "Готово" },
];

export function CheckoutSteps({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-between mb-8 px-2">
      {steps.map((step, i) => {
        const done = current > step.id;
        const active = current === step.id;
        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1 min-w-0">
              <div
                className={cn(
                  "w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors",
                  done && "bg-primary border-primary text-primary-foreground",
                  active && "border-primary text-primary bg-primary/10",
                  !done && !active && "border-muted-foreground/30 text-muted-foreground",
                )}
              >
                {done ? <Check className="h-5 w-5" /> : step.id}
              </div>
              <span
                className={cn(
                  "text-[10px] sm:text-xs font-medium truncate max-w-[72px] sm:max-w-none",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-1 sm:mx-2 mb-5",
                  done ? "bg-primary" : "bg-muted",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
