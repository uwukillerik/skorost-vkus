import type { OrderDto } from "@shared/api";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/payment-labels";

const RECEIPT_ROOT_ID = "order-receipt";
const PDF_WIDTH_MM = 80;

function parseItemName(name: string) {
  const lines = name.split("\n");
  return { title: lines[0], subs: lines.slice(1).filter(Boolean) };
}

export function getReceiptElement(): HTMLElement | null {
  return document.getElementById(RECEIPT_ROOT_ID);
}

/** Клон чека вне scroll-контейнера — html2canvas снимает всё целиком */
function cloneReceiptForCapture(source: HTMLElement): HTMLElement {
  const clone = source.cloneNode(true) as HTMLElement;
  clone.id = `${RECEIPT_ROOT_ID}-pdf-clone`;
  clone.style.position = "fixed";
  clone.style.left = "-10000px";
  clone.style.top = "0";
  clone.style.zIndex = "-1";
  clone.style.width = `${source.offsetWidth}px`;
  clone.style.maxHeight = "none";
  clone.style.overflow = "visible";
  document.body.appendChild(clone);
  return clone;
}

export async function generateReceiptPdfBlob(
  order: OrderDto,
): Promise<Blob> {
  const source = getReceiptElement();
  if (!source) {
    throw new Error("Откройте страницу заказа, чтобы сформировать чек");
  }

  const clone = cloneReceiptForCapture(source);

  try {
    const canvas = await html2canvas(clone, {
      scale: 2,
      backgroundColor: "#fffef8",
      logging: false,
      useCORS: true,
      width: clone.scrollWidth,
      height: clone.scrollHeight,
      windowWidth: clone.scrollWidth,
      windowHeight: clone.scrollHeight,
    });

    const imgData = canvas.toDataURL("image/png");
    const pageHeightMm = Math.max(
      (canvas.height * PDF_WIDTH_MM) / canvas.width,
      50,
    );

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [PDF_WIDTH_MM, pageHeightMm],
    });

    pdf.addImage(imgData, "PNG", 0, 0, PDF_WIDTH_MM, pageHeightMm);
    return pdf.output("blob");
  } finally {
    clone.remove();
  }
}

export async function downloadReceiptPdf(order: OrderDto): Promise<void> {
  const blob = await generateReceiptPdfBlob(order);
  const filename = `chek-${order.id.slice(-8).toUpperCase()}.pdf`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function printReceipt(order: OrderDto): Promise<void> {
  const blob = await generateReceiptPdfBlob(order);
  const url = URL.createObjectURL(blob);
  const w = window.open(url, "_blank");
  if (!w) {
    await downloadReceiptPdf(order);
    return;
  }
  w.addEventListener("load", () => {
    try {
      w.print();
    } catch {
      /* PDF viewer may block auto-print */
    }
  });
}

/** Запасной вариант: печать через HTML, если PDF не удался */
export function buildReceiptHtml(order: OrderDto): string {
  const itemsHtml = order.items
    .map((item) => {
      const { title, subs } = parseItemName(item.productName);
      const subsHtml = subs
        .map(
          (s) =>
            `<div style="padding-left:12px;font-size:11px;color:#666">${s}</div>`,
        )
        .join("");
      return `
        <div style="margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;font-weight:bold;font-size:13px">
            <span>${item.quantity}× ${title}</span>
            <span>${item.subtotal}₽</span>
          </div>
          ${subsHtml}
        </div>`;
    })
    .join("");

  const date = format(new Date(order.createdAt), "dd.MM.yyyy HH:mm", {
    locale: ru,
  });

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8"/>
  <title>Чек ${order.id.slice(-8)}</title>
  <style>
    body { font-family: Consolas, monospace; max-width: 320px; margin: 24px auto; padding: 16px; color: #111; }
    h1 { font-family: system-ui, sans-serif; font-size: 18px; text-align: center; margin: 0 0 4px; }
    .meta { font-size: 11px; color: #555; text-align: center; margin-bottom: 16px; }
    .row { display: flex; justify-content: space-between; font-size: 12px; margin: 4px 0; }
    .total { font-size: 16px; font-weight: bold; border-top: 2px solid #333; margin-top: 12px; padding-top: 8px; }
    hr { border: none; border-top: 1px dashed #ccc; margin: 12px 0; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <h1>СКОРОСТЬ & ВКУС</h1>
  <p class="meta">Кассовый чек · ${date}</p>
  <div class="row"><span>№ заказа</span><strong>${order.id.slice(-8).toUpperCase()}</strong></div>
  <div class="row"><span>Тип</span><span>${order.deliveryType === "PICKUP" ? "Самовывоз" : "Доставка"}</span></div>
  ${order.paymentMethod ? `<div class="row"><span>Оплата</span><span>${PAYMENT_METHOD_LABELS[order.paymentMethod]}</span></div>` : ""}
  <div class="row"><span>Статус</span><span>${PAYMENT_STATUS_LABELS[order.paymentStatus]}</span></div>
  <hr/>
  ${itemsHtml}
  <hr/>
  <div class="row"><span>Подытог</span><span>${order.subtotal}₽</span></div>
  <div class="row"><span>Доставка</span><span>${order.deliveryFee}₽</span></div>
  <div class="row total"><span>ИТОГО</span><span>${order.totalAmount}₽</span></div>
  <p class="meta" style="margin-top:16px">${order.address}</p>
  <p class="meta">Спасибо за заказ!</p>
  <script>window.onload = () => { window.print(); }</script>
</body>
</html>`;
}
