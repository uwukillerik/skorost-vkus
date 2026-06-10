import { useState } from "react";
import type { OrderDto } from "@shared/api";
import { Button } from "@/components/ui/button";
import { OrderReceipt } from "@/components/order/OrderReceipt";
import { downloadReceiptPdf, printReceipt } from "@/lib/download-receipt";
import { Download, Loader2, Printer, Receipt } from "lucide-react";
import { toast } from "sonner";

interface OrderReceiptPanelProps {
  order: OrderDto;
}

export function OrderReceiptPanel({ order }: OrderReceiptPanelProps) {
  const [loading, setLoading] = useState<"pdf" | "print" | null>(null);

  const handleDownloadPdf = async () => {
    setLoading("pdf");
    try {
      await downloadReceiptPdf(order);
      toast.success("Чек сохранён в PDF");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Не удалось создать PDF",
      );
    } finally {
      setLoading(null);
    }
  };

  const handlePrint = async () => {
    setLoading("print");
    try {
      await printReceipt(order);
      toast.success("PDF открыт — можно распечатать");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Не удалось открыть печать",
      );
    } finally {
      setLoading(null);
    }
  };

  return (
    <aside className="warm-card overflow-hidden flex flex-col min-w-0 md:sticky md:top-[4.5rem] md:self-start">
      <div className="p-4 border-b border-border/60 bg-gradient-to-r from-primary/5 to-transparent space-y-3">
        <div className="flex items-center gap-2">
          <Receipt className="h-4 w-4 text-primary shrink-0" />
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
            Электронный чек
          </p>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-2xl font-black text-primary leading-none">
              {order.totalAmount}₽
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              № {order.id.slice(-8).toUpperCase()}
            </p>
          </div>
        </div>
        <div className="mobile-btn-row">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl h-10 text-xs font-semibold w-full"
            disabled={loading !== null}
            onClick={handlePrint}
          >
            {loading === "print" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Printer className="h-4 w-4 mr-1.5 shrink-0" />
                Печать
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-xl h-10 text-xs font-semibold w-full"
            disabled={loading !== null}
            onClick={handleDownloadPdf}
          >
            {loading === "pdf" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Download className="h-4 w-4 mr-1.5 shrink-0" />
                Скачать PDF
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="p-3 sm:p-4 bg-muted/20 overflow-x-auto">
        <OrderReceipt order={order} compact />
      </div>
    </aside>
  );
}
