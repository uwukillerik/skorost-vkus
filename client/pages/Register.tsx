import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { LegalConsentCheckbox } from "@/components/LegalConsentCheckbox";
import { toast } from "sonner";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) setReferralCode(ref.toUpperCase());
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedLegal) {
      toast.error("Подтвердите согласие с документами");
      return;
    }
    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
        referralCode: referralCode.trim() || undefined,
      });
      toast.success("Регистрация успешна!");
      navigate("/profile");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageShell title="Регистрация" subtitle="Новый аккаунт">
      <div className="warm-card overflow-hidden">
        <div className="hero-mesh px-5 py-5 text-white">
          <h2 className="text-xl font-extrabold">Создайте аккаунт</h2>
          <p className="text-white/75 text-sm mt-1">Баллы, заказы и быстрый заказ в пару кликов</p>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div className="space-y-2">
            <Label htmlFor="name">Имя</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="h-11 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="h-11 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Телефон</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+7 (999) 123-45-67"
              className="h-11 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="referral">Промокод друга (необязательно)</Label>
            <Input
              id="referral"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
              placeholder="SVIVAN01"
              className="h-11 rounded-xl font-mono uppercase"
            />
            {referralCode && (
              <p className="text-xs text-primary font-medium">+200 баллов при регистрации</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
              className="h-11 rounded-xl"
            />
          </div>
          <LegalConsentCheckbox
            checked={acceptedLegal}
            onCheckedChange={setAcceptedLegal}
            id="register-legal"
          />
          <Button
            type="submit"
            className="w-full h-11 rounded-xl font-bold text-base"
            disabled={loading || !acceptedLegal}
          >
            {loading ? "Регистрация..." : "Создать аккаунт"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground px-5 pb-5">
          Уже есть аккаунт?{" "}
          <Link to="/login" className="text-primary font-semibold">
            Войти
          </Link>
        </p>
      </div>
    </AuthPageShell>
  );
}
