import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { LoyaltyCard } from "@/components/loyalty/LoyaltyCard";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ShoppingBag,
  Mail,
  Phone,
  User,
  Lock,
  Crown,
  ChevronRight,
  UtensilsCrossed,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Bell } from "lucide-react";
import {
  isPushSupported,
  subscribeToOrderPush,
} from "@/lib/push-notifications";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export default function Profile() {
  const { user, refresh } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    currentPassword: "",
    newPassword: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        name: user.name,
        phone: user.phone || "",
      }));
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.auth.updateProfile({
        name: form.name,
        phone: form.phone || null,
        ...(form.newPassword
          ? {
              currentPassword: form.currentPassword,
              newPassword: form.newPassword,
            }
          : {}),
      });
      await refresh();
      toast.success("Данные сохранены");
      setForm((f) => ({ ...f, currentPassword: "", newPassword: "" }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const memberSince = user.createdAt
    ? format(new Date(user.createdAt), "LLLL yyyy", { locale: ru })
    : null;

  return (
    <Layout>
      <div className="page-with-bottom-nav min-h-dvh bg-muted/20">
        <div className="bg-card border-b border-border/60">
          <div className="page-container max-w-5xl py-4 sm:py-8 lg:py-10">
            <div className="flex flex-row items-center gap-3 sm:gap-8 md:items-start">
              <ProfileAvatar
                user={user}
                size="md"
                compact
                onUpdated={refresh}
                className="md:hidden"
              />
              <ProfileAvatar
                user={user}
                size="xl"
                onUpdated={refresh}
                className="hidden md:flex"
              />

              <div className="flex-1 min-w-0 text-left">
                <p className="text-primary font-bold text-[11px] sm:text-sm mb-0.5">
                  Личный кабинет
                </p>
                <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-foreground truncate">
                  {user.name}
                </h1>
                <p className="text-muted-foreground text-xs sm:text-sm mt-0.5 truncate">
                  {user.email}
                </p>
                {user.phone && (
                  <p className="text-muted-foreground text-xs sm:text-sm truncate">
                    {user.phone}
                  </p>
                )}

                <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 sm:mt-4">
                  {user.loyaltyPoints != null && user.loyaltyPoints > 0 && (
                    <span className="inline-flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 rounded-full px-2.5 py-1 sm:px-4 sm:py-2 text-[11px] sm:text-sm font-bold">
                      <Crown className="h-3 w-3 sm:h-4 sm:w-4" />
                      {user.loyaltyPoints} баллов
                    </span>
                  )}
                  {user.referralCode && (
                    <span className="inline-flex items-center gap-1 bg-accent/15 text-accent-foreground border border-accent/30 rounded-full px-2.5 py-1 sm:px-4 sm:py-2 text-[11px] sm:text-sm font-bold max-w-full truncate">
                      <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                      <span className="truncate">Код: {user.referralCode}</span>
                    </span>
                  )}
                  {memberSince && (
                    <span className="hidden sm:inline-flex items-center rounded-full px-4 py-2 text-xs font-medium bg-muted text-muted-foreground">
                      Клиент с {memberSince}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="page-container max-w-5xl py-4 sm:py-8 lg:py-10">
          <div className="grid lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
            <aside className="lg:col-span-4 space-y-3">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1 hidden lg:block">
                Быстрые действия
              </p>
              <Link
                to="/orders"
                className="warm-card flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:border-primary/30 hover:shadow-md transition-all"
              >
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold">Мои заказы</p>
                  <p className="text-xs text-muted-foreground">
                    История и отслеживание
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
              </Link>
              <Link
                to="/menu"
                className="warm-card flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:border-primary/30 transition-all"
              >
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  <UtensilsCrossed className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-bold">Меню</p>
                  <p className="text-xs text-muted-foreground">Новый заказ</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
              </Link>
            </aside>

            <div className="lg:col-span-8">
              <Tabs defaultValue="bonus" className="w-full">
                <TabsList className="w-full h-11 grid grid-cols-2 rounded-xl bg-card border p-1 mb-6">
                  <TabsTrigger
                    value="bonus"
                    className="rounded-lg font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Бонусы
                  </TabsTrigger>
                  <TabsTrigger
                    value="settings"
                    className="rounded-lg font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Настройки
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="bonus" className="mt-0 focus-visible:outline-none">
                  <LoyaltyCard />
                </TabsContent>

                <TabsContent value="settings" className="mt-0 focus-visible:outline-none space-y-4">
                  <div className="warm-card p-4 flex flex-col items-center md:hidden">
                    <p className="text-sm font-bold mb-3 w-full text-left">
                      Фото профиля
                    </p>
                    <ProfileAvatar user={user} size="lg" onUpdated={refresh} />
                  </div>
                  {isPushSupported() && (
                    <div className="warm-card p-5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                      <div className="flex gap-3">
                        <Bell className="h-5 w-5 text-primary shrink-0" />
                        <div>
                          <p className="font-bold">Push-уведомления</p>
                          <p className="text-sm text-muted-foreground">
                            О статусах всех ваших заказов
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-xl font-semibold shrink-0"
                        onClick={async () => {
                          const ok = await subscribeToOrderPush({});
                          if (ok) toast.success("Уведомления включены");
                          else toast.error("Разрешите уведомления в браузере");
                        }}
                      >
                        Включить
                      </Button>
                    </div>
                  )}
                  <div className="warm-card">
                    <div className="px-5 sm:px-6 py-4 border-b">
                      <h2 className="font-bold text-lg">Личные данные</h2>
                      <p className="text-sm text-muted-foreground">
                        Имя, контакты и пароль
                      </p>
                    </div>
                    <form
                      onSubmit={handleSave}
                      className="p-5 sm:p-6 space-y-5"
                    >
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            value={user.email}
                            disabled
                            className="pl-10 h-11 rounded-xl bg-muted/50"
                          />
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Имя</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="name"
                              value={form.name}
                              onChange={(e) =>
                                setForm({ ...form, name: e.target.value })
                              }
                              required
                              className="pl-10 h-11 rounded-xl"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Телефон</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="phone"
                              value={form.phone}
                              onChange={(e) =>
                                setForm({ ...form, phone: e.target.value })
                              }
                              className="pl-10 h-11 rounded-xl"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="rounded-xl border border-dashed p-4 space-y-3 bg-muted/30">
                        <p className="font-semibold text-sm flex items-center gap-2">
                          <Lock className="h-4 w-4 text-primary" />
                          Сменить пароль
                        </p>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <Input
                            type="password"
                            placeholder="Текущий пароль"
                            value={form.currentPassword}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                currentPassword: e.target.value,
                              })
                            }
                            className="rounded-xl"
                          />
                          <Input
                            type="password"
                            placeholder="Новый пароль"
                            value={form.newPassword}
                            onChange={(e) =>
                              setForm({ ...form, newPassword: e.target.value })
                            }
                            className="rounded-xl"
                          />
                        </div>
                      </div>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="rounded-xl h-11 px-8 font-bold"
                      >
                        {loading ? "Сохранение..." : "Сохранить"}
                      </Button>
                    </form>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
