import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckoutSteps } from "@/components/checkout/CheckoutSteps";
import {
  OrderSummary,
  useOrderTotals,
} from "@/components/checkout/OrderSummary";
import { PremiumPayment } from "@/components/checkout/PremiumPayment";
import type { DeliveryType, PaymentMethod } from "@shared/api";
import { toast } from "sonner";
import { Truck, Store } from "lucide-react";
import { PickupTimeSelect } from "@/components/checkout/PickupTimeSelect";
import { getPickupSlots } from "@/lib/pickup-slots";
import { scrollToElement } from "@/hooks/use-scroll-to-top";
import { buildOrderNotes } from "@/lib/cart-order-notes";
import { LegalConsentCheckbox } from "@/components/LegalConsentCheckbox";
import {
  formatPhoneInput,
  isValidPhone,
  PHONE_ERROR,
  formatPhoneForStorage,
} from "@shared/phone";
import { validateCardForm } from "@shared/payment-card";
import { cn } from "@/lib/utils";

export default function Checkout() {
  const { items, combos, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const stepAnchorRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("DELIVERY");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CARD");
  const [card, setCard] = useState({
    number: "",
    expiry: "",
    cvv: "",
    holder: "",
  });
  const [pickupAt, setPickupAt] = useState("");
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    address: "",
    comment: "",
    guestName: user?.name || "",
    guestPhone: user?.phone || "",
    guestEmail: user?.email || "",
  });

  useEffect(() => {
    if (deliveryType === "PICKUP") {
      const slots = getPickupSlots();
      if (slots[0] && !pickupAt) setPickupAt(slots[0].value);
    }
  }, [deliveryType, pickupAt]);

  useEffect(() => {
    scrollToElement(stepAnchorRef.current, "smooth");
  }, [step]);

  const { total } = useOrderTotals(items, combos, deliveryType);

  const goToStep = (next: number) => {
    setStep(next);
  };

  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};

    if (deliveryType === "DELIVERY" && form.address.trim().length < 5) {
      errors.address = "Укажите полный адрес доставки";
    }
    if (deliveryType === "PICKUP" && !pickupAt) {
      errors.pickupAt = "Выберите время самовывоза";
    }
    if (!isAuthenticated) {
      if (form.guestName.trim().length < 2) {
        errors.guestName = "Имя: минимум 2 символа";
      }
      if (!form.guestPhone.trim()) {
        errors.guestPhone = "Укажите телефон";
      } else if (!isValidPhone(form.guestPhone)) {
        errors.guestPhone = PHONE_ERROR;
      }
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      const first = Object.values(errors)[0];
      toast.error(first);
      return false;
    }
    return true;
  };

  const validateBeforePay = (): boolean => {
    if (!acceptedLegal) {
      toast.error("Подтвердите согласие с документами");
      return false;
    }
    if (paymentMethod === "CARD") {
      const cardError = validateCardForm(card);
      if (cardError) {
        toast.error(cardError);
        return false;
      }
    }
    return true;
  };

  if (items.length === 0 && combos.length === 0 && step < 3) {
    return (
      <Layout>
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground mb-4">Корзина пуста</p>
          <Button onClick={() => navigate("/menu")}>В меню</Button>
        </div>
      </Layout>
    );
  }

  const handleCreateAndPay = async () => {
    if (!validateBeforePay()) return;

    setLoading(true);
    try {
      const res = await api.orders.create({
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
        })),
        combos: combos.map((c) => ({
          comboId: c.combo.id,
          quantity: c.quantity,
        })),
        address:
          deliveryType === "PICKUP" ? "Самовывоз" : form.address,
        comment: buildOrderNotes(items, combos, form.comment),
        deliveryType,
        pickupAt: deliveryType === "PICKUP" ? pickupAt : undefined,
        paymentMethod,
        ...(!isAuthenticated
          ? {
              guestName: form.guestName.trim(),
              guestPhone: formatPhoneForStorage(form.guestPhone),
              guestEmail: form.guestEmail || undefined,
            }
          : {}),
      });

      const token = res.guestAccessToken;
      if (token) {
        sessionStorage.setItem(`order-token-${res.order.id}`, token);
      }

      let order = res.order;

      if (paymentMethod === "CASH") {
        clearCart();
        toast.success("Заказ принят! Оплата при получении.");
        navigate(`/order/${order.id}`);
        return;
      }

      const payRes = await api.payments.pay(
        order.id,
        paymentMethod === "CARD"
          ? {
              cardNumber: card.number,
              expiry: card.expiry,
              cvv: card.cvv,
              cardHolder: card.holder,
            }
          : {},
        token,
      );

      order = payRes.order;
      clearCart();
      toast.success(payRes.message);
      navigate(`/order/${order.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="page-container max-w-2xl py-6 sm:py-10 page-without-bottom-nav">
        <h1 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-6">Оформление</h1>
        <CheckoutSteps current={step} />
        <div ref={stepAnchorRef} className="scroll-mt-24" aria-hidden />

        {step === 1 && (
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Способ получения</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={deliveryType}
                  onValueChange={(v) =>
                    setDeliveryType(v as DeliveryType)
                  }
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                >
                  <label
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer ${
                      deliveryType === "DELIVERY"
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <RadioGroupItem value="DELIVERY" />
                    <Truck className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold text-sm">Доставка</p>
                      <p className="text-xs text-muted-foreground">
                        15–20 мин
                      </p>
                    </div>
                  </label>
                  <label
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer ${
                      deliveryType === "PICKUP"
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <RadioGroupItem value="PICKUP" />
                    <Store className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold text-sm">Самовывоз</p>
                      <p className="text-xs text-muted-foreground">
                        ул. Тверская, 1
                      </p>
                    </div>
                  </label>
                </RadioGroup>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                {!isAuthenticated && (
                  <>
                    <div>
                      <Label>Имя *</Label>
                      <Input
                        value={form.guestName}
                        onChange={(e) => {
                          setForm({ ...form, guestName: e.target.value });
                          if (fieldErrors.guestName) {
                            setFieldErrors((prev) => {
                              const next = { ...prev };
                              delete next.guestName;
                              return next;
                            });
                          }
                        }}
                        className={cn(fieldErrors.guestName && "border-destructive")}
                        required
                      />
                      {fieldErrors.guestName && (
                        <p className="text-xs text-destructive mt-1">{fieldErrors.guestName}</p>
                      )}
                    </div>
                    <div>
                      <Label>Телефон *</Label>
                      <Input
                        value={form.guestPhone}
                        onChange={(e) => {
                          setForm({
                            ...form,
                            guestPhone: formatPhoneInput(e.target.value),
                          });
                          if (fieldErrors.guestPhone) {
                            setFieldErrors((prev) => {
                              const next = { ...prev };
                              delete next.guestPhone;
                              return next;
                            });
                          }
                        }}
                        type="tel"
                        inputMode="tel"
                        placeholder="+7 (999) 123-45-67"
                        className={cn(fieldErrors.guestPhone && "border-destructive")}
                        required
                      />
                      {fieldErrors.guestPhone ? (
                        <p className="text-xs text-destructive mt-1">{fieldErrors.guestPhone}</p>
                      ) : (
                        <p className="text-xs text-muted-foreground mt-1">
                          Минимум 10 цифр — для связи по заказу
                        </p>
                      )}
                    </div>
                  </>
                )}
                {deliveryType === "DELIVERY" && (
                  <div>
                    <Label>Адрес доставки *</Label>
                    <Input
                      value={form.address}
                      onChange={(e) => {
                        setForm({ ...form, address: e.target.value });
                        if (fieldErrors.address) {
                          setFieldErrors((prev) => {
                            const next = { ...prev };
                            delete next.address;
                            return next;
                          });
                        }
                      }}
                      className={cn(fieldErrors.address && "border-destructive")}
                      required
                      placeholder="ул. Ленина, 10, кв. 5"
                    />
                    {fieldErrors.address && (
                      <p className="text-xs text-destructive mt-1">{fieldErrors.address}</p>
                    )}
                  </div>
                )}
                {deliveryType === "PICKUP" && (
                  <PickupTimeSelect
                    value={pickupAt}
                    onChange={setPickupAt}
                  />
                )}
                <div>
                  <Label>Комментарий</Label>
                  <Textarea
                    value={form.comment}
                    onChange={(e) =>
                      setForm({ ...form, comment: e.target.value })
                    }
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            <OrderSummary
              items={items}
              combos={combos}
              deliveryType={deliveryType}
            />

            <Button
              className="w-full h-12 font-bold rounded-2xl"
              onClick={() => {
                if (validateStep1()) goToStep(2);
              }}
            >
              Далее к оплате · {total}₽
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <OrderSummary
              items={items}
              combos={combos}
              deliveryType={deliveryType}
            />
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border-2 border-primary/10">
              <h2 className="font-black text-xl mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-accent text-secondary flex items-center justify-center text-sm">
                  2
                </span>
                Оплата
              </h2>
              <LegalConsentCheckbox
                checked={acceptedLegal}
                onCheckedChange={setAcceptedLegal}
                id="checkout-legal"
                className="mb-4"
              />
              <PremiumPayment
                method={paymentMethod}
                onMethodChange={setPaymentMethod}
                card={card}
                onCardChange={setCard}
                onPay={handleCreateAndPay}
                loading={loading}
                total={total}
                payDisabled={!acceptedLegal}
              />
            </div>
            <Button variant="ghost" className="w-full" onClick={() => goToStep(1)}>
              ← Назад
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
