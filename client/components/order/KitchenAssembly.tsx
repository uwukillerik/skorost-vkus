import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import type { OrderItemDto } from "@shared/api";

export function KitchenAssembly({ items }: { items: OrderItemDto[] }) {
  if (items.length === 0) return null;

  return (
    <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Flame className="h-5 w-5 text-primary" />
        </motion.div>
        <p className="font-bold text-primary">Собираем на кухне</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
            className="bg-white rounded-xl px-3 py-2 shadow-sm border text-sm flex items-center gap-2"
          >
            <span className="w-6 h-6 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center">
              {item.quantity}
            </span>
            <span className="font-medium max-w-[140px] truncate">
              {item.productName.split("\n")[0].replace("🍱 ", "")}
            </span>
            <motion.span
              className="text-primary text-xs"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
            >
              ●
            </motion.span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
