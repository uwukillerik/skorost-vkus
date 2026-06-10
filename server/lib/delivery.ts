export const FREE_DELIVERY_FROM = 500;
export const DELIVERY_FEE = 99;

export function calcDeliveryFee(
  subtotal: number,
  deliveryType: "DELIVERY" | "PICKUP",
): number {
  if (deliveryType === "PICKUP") return 0;
  return subtotal >= FREE_DELIVERY_FROM ? 0 : DELIVERY_FEE;
}
