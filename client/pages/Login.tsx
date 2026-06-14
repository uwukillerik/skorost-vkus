import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, isAdmin, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname || "/";

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(isAdmin ? "/admin" : from, { replace: true });
    }
  }, [isLoading, isAuthenticated, isAdmin, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail.includes("@") || !trimmedEmail.includes(".")) {
      toast.error("Введите полный email, например admin@skorost-vkus.ru");
      return;
    }
    setLoading(true);
    try {
      const loggedIn = await login(trimmedEmail, password);
      toast.success("Добро пожаловать!");
      navigate(loggedIn.role === "ADMIN" ? "/admin" : from);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageShell title="Вход" subtitle="Скорость & Вкус">
      <div className="warm-card overflow-hidden">
        <div className="hero-mesh px-5 py-5 text-white">
          <h2 className="text-xl font-extrabold">С возвращением!</h2>
          <p className="text-white/75 text-sm mt-1">Войдите, чтобы заказывать и копить баллы</p>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@skorost-vkus.ru"
              autoComplete="email"
              className="h-11 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-11 rounded-xl"
            />
          </div>
          <Button
            type="submit"
            className="w-full h-11 rounded-xl font-bold text-base"
            disabled={loading}
          >
            {loading ? "Вход..." : "Войти"}
          </Button>
        </form>

        <div className="px-5 pb-5 space-y-3">
          <p className="text-center text-sm text-muted-foreground">
            Нет аккаунта?{" "}
            <Link to="/register" className="text-primary font-semibold">
              Зарегистрироваться
            </Link>
          </p>
          <div className="rounded-xl bg-muted/50 px-3 py-2 text-xs text-muted-foreground space-y-1">
            <p>Демо: user@example.com / user123</p>
            <p>Админ: admin@skorost-vkus.ru / admin123</p>
          </div>
        </div>
      </div>
    </AuthPageShell>
  );
}
