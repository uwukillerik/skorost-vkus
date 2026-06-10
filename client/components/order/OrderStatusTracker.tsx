import type { OrderStatus } from "@shared/api";
import { cn } from "@/lib/utils";
import {
  TRACKING_STEPS,
  getActiveStepIndex,
  getProgressPercent,
  CANCELLED_STEP,
} from "@/lib/order-tracking";
import type { LucideIcon } from "lucide-react";
import { Check } from "lucide-react";

interface OrderStatusTrackerProps {
  status: OrderStatus;
  deliveryType: "DELIVERY" | "PICKUP";
}

export function OrderStatusTracker({
  status,
  deliveryType,
}: OrderStatusTrackerProps) {
  const activeIdx = getActiveStepIndex(status);
  const progress = getProgressPercent(status);
  const isCancelled = status === "CANCELLED";

  if (isCancelled) {
    const Icon = CANCELLED_STEP.icon;
    return (
      <div className="warm-card p-5 sm:p-6 text-center border-red-200 bg-red-50">
        <Icon className="h-10 w-10 text-red-500 mx-auto mb-2" />
        <p className="font-bold text-red-900">{CANCELLED_STEP.label}</p>
        <p className="text-sm text-red-700 mt-1">{CANCELLED_STEP.description}</p>
      </div>
    );
  }

  const lastLabel =
    deliveryType === "PICKUP" ? "Готов к выдаче" : "Доставлен";

  const currentStep = TRACKING_STEPS[activeIdx];
  const currentLabel =
    activeIdx === TRACKING_STEPS.length - 1 && deliveryType === "PICKUP"
      ? "Готов к выдаче"
      : currentStep?.label ?? "Обрабатываем";

  return (
    <>
      <div className="hidden md:block warm-card p-5 sm:p-6">
        <StatusBarDesktop
          activeIdx={activeIdx}
          progress={progress}
          deliveryType={deliveryType}
          lastLabel={lastLabel}
          currentLabel={currentLabel}
          currentDescription={currentStep?.description}
        />
      </div>
      <div className="md:hidden warm-card p-4">
        <StatusBarMobile
          activeIdx={activeIdx}
          progress={progress}
          deliveryType={deliveryType}
          lastLabel={lastLabel}
          currentLabel={currentLabel}
          currentDescription={currentStep?.description}
        />
      </div>
    </>
  );
}

function StatusHeader({
  currentLabel,
  currentDescription,
  progress,
}: {
  currentLabel: string;
  currentDescription?: string;
  progress: number;
}) {
  return (
    <div className="flex items-start justify-between gap-3 mb-3">
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
          Статус заказа
        </p>
        <p className="text-base sm:text-lg font-extrabold text-foreground mt-0.5 leading-tight">
          {currentLabel}
        </p>
        {currentDescription && (
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-snug">
            {currentDescription}
          </p>
        )}
      </div>
      <div className="text-right shrink-0 bg-primary/10 rounded-xl px-3 py-2">
        <span className="text-xl font-black text-primary leading-none">
          {progress}%
        </span>
        <p className="text-[9px] text-muted-foreground uppercase mt-0.5">
          готово
        </p>
      </div>
    </div>
  );
}

function ProgressLine({ progress }: { progress: number }) {
  return (
    <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
      <div
        className="h-full bg-gradient-to-r from-primary to-orange-500 rounded-full transition-all duration-500"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

function StatusBarDesktop({
  activeIdx,
  progress,
  deliveryType,
  lastLabel,
  currentLabel,
  currentDescription,
}: {
  activeIdx: number;
  progress: number;
  deliveryType: "DELIVERY" | "PICKUP";
  lastLabel: string;
  currentLabel: string;
  currentDescription?: string;
}) {
  return (
    <div>
      <StatusHeader
        currentLabel={currentLabel}
        currentDescription={currentDescription}
        progress={progress}
      />
      <ProgressLine progress={progress} />
      <div className="flex justify-between gap-1">
        {TRACKING_STEPS.map((step, i) => (
          <HorizontalStep
            key={step.id}
            step={step}
            i={i}
            activeIdx={activeIdx}
            deliveryType={deliveryType}
            lastLabel={lastLabel}
          />
        ))}
      </div>
    </div>
  );
}

function StatusBarMobile({
  activeIdx,
  progress,
  deliveryType,
  lastLabel,
  currentLabel,
  currentDescription,
}: {
  activeIdx: number;
  progress: number;
  deliveryType: "DELIVERY" | "PICKUP";
  lastLabel: string;
  currentLabel: string;
  currentDescription?: string;
}) {
  return (
    <div>
      <StatusHeader
        currentLabel={currentLabel}
        currentDescription={currentDescription}
        progress={progress}
      />
      <ProgressLine progress={progress} />
      <ul className="space-y-0">
        {TRACKING_STEPS.map((step, i) => {
          const done = i < activeIdx;
          const active = i === activeIdx;
          const isLast = i === TRACKING_STEPS.length - 1;
          const label =
            isLast && deliveryType === "PICKUP" ? lastLabel : step.label;
          const Icon = step.icon;
          return (
            <li key={step.id} className="flex gap-3 relative">
              {i < TRACKING_STEPS.length - 1 && (
                <div
                  className={cn(
                    "absolute left-[15px] top-8 bottom-0 w-0.5",
                    done || active ? "bg-primary/40" : "bg-muted",
                  )}
                />
              )}
              <div
                className={cn(
                  "relative z-10 h-8 w-8 rounded-full flex items-center justify-center border-2 shrink-0",
                  done && "bg-primary border-primary text-primary-foreground",
                  active &&
                    "bg-primary border-primary text-primary-foreground ring-2 ring-primary/25",
                  !done &&
                    !active &&
                    "border-muted bg-card text-muted-foreground",
                )}
              >
                {done ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-3.5 w-3.5" />
                )}
              </div>
              <div className="pb-4 pt-1 min-w-0 flex-1">
                <p
                  className={cn(
                    "text-sm font-bold leading-tight",
                    active && "text-primary",
                    done && !active && "text-foreground",
                    !done && !active && "text-muted-foreground",
                  )}
                >
                  {label}
                </p>
                {active && step.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {step.description}
                  </p>
                )}
                {active && step.eta && (
                  <p className="text-[10px] text-primary/80 font-semibold mt-1">
                    ≈ {step.eta}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function HorizontalStep({
  step,
  i,
  activeIdx,
  deliveryType,
  lastLabel,
}: {
  step: (typeof TRACKING_STEPS)[0];
  i: number;
  activeIdx: number;
  deliveryType: "DELIVERY" | "PICKUP";
  lastLabel: string;
}) {
  const done = i < activeIdx;
  const active = i === activeIdx;
  const pending = i > activeIdx;
  const isLast = i === TRACKING_STEPS.length - 1;
  const label = isLast && deliveryType === "PICKUP" ? lastLabel : step.label;
  const Icon = step.icon;

  return (
    <div className="flex flex-col items-center flex-1 min-w-0 relative">
      {i < TRACKING_STEPS.length - 1 && (
        <div
          className={cn(
            "absolute top-4 left-[50%] w-full h-0.5 -z-0",
            i < activeIdx ? "bg-primary" : "bg-muted",
          )}
        />
      )}
      <div
        className={cn(
          "relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 bg-card",
          done && "bg-primary border-primary text-primary-foreground",
          active &&
            "bg-primary border-primary text-primary-foreground ring-4 ring-primary/20",
          pending && "border-muted text-muted-foreground",
        )}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>
      <p
        className={cn(
          "text-[10px] sm:text-xs font-semibold text-center mt-2 leading-tight px-0.5",
          active && "text-primary",
          pending && "text-muted-foreground",
          done && "text-foreground",
        )}
      >
        {label}
      </p>
    </div>
  );
}
