import { motion } from "framer-motion";
import { MapPin, Store, Bike } from "lucide-react";
import type { OrderStatus } from "@shared/api";
import { cn } from "@/lib/utils";

interface DeliveryMapProps {
  status: OrderStatus;
  address: string;
  deliveryType: "DELIVERY" | "PICKUP";
}

export function DeliveryMap({ status, address, deliveryType }: DeliveryMapProps) {
  const onWay =
    status === "READY" ||
    (deliveryType === "DELIVERY" && status === "DELIVERED");
  const atRestaurant = status === "READY" && deliveryType === "PICKUP";
  const delivered = status === "DELIVERED";

  return (
    <div className="rounded-2xl overflow-hidden border-2 border-muted bg-[#e8f4ea] shadow-md">
      <div className="relative h-48 sm:h-56 bg-gradient-to-b from-sky-100 to-emerald-50">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="absolute left-[18%] top-[35%] flex flex-col items-center">
          <div className="bg-secondary text-white p-2 rounded-full shadow-lg">
            <Store className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-bold mt-1 bg-white/90 px-2 py-0.5 rounded">
            Ресторан
          </span>
        </div>
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 300 150"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M 55 65 Q 150 25 235 85"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            strokeDasharray="8 6"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: onWay || delivered ? 1 : 0.35 }}
            transition={{ duration: 1.2 }}
          />
        </svg>
        <motion.div
          className="absolute"
          style={{ left: delivered ? "72%" : onWay ? "55%" : "22%", top: delivered ? "50%" : onWay ? "38%" : "32%" }}
          animate={{ left: delivered ? "72%" : onWay ? "55%" : "22%", top: delivered ? "50%" : onWay ? "38%" : "32%" }}
          transition={{ duration: 0.8 }}
        >
          <div
            className={cn(
              "p-2 rounded-full shadow-lg",
              delivered ? "bg-green-600 text-white" : "bg-primary text-primary-foreground",
            )}
          >
            {deliveryType === "PICKUP" && atRestaurant ? (
              <MapPin className="h-5 w-5" />
            ) : (
              <Bike className="h-5 w-5" />
            )}
          </div>
        </motion.div>
        <div className="absolute right-[12%] bottom-[28%] flex flex-col items-center">
          <div className="bg-white p-2 rounded-full shadow-lg border-2 border-primary">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <span className="text-[10px] font-bold mt-1 bg-white/90 px-2 py-0.5 rounded max-w-[80px] truncate">
            Вы
          </span>
        </div>
      </div>
      <div className="p-4 bg-white text-sm">
        <p className="font-bold text-foreground mb-1">
          {deliveryType === "PICKUP" ? "Самовывоз" : "Доставка"}
        </p>
        <p className="text-muted-foreground text-xs leading-relaxed">{address}</p>
        <p className="text-xs font-bold text-primary mt-2">
          {delivered
            ? "Заказ у вас — приятного аппетита!"
            : onWay
              ? "Курьер в пути"
              : status === "PREPARING"
                ? "Готовим на кухне"
                : "Ожидаем подтверждения"}
        </p>
      </div>
    </div>
  );
}
