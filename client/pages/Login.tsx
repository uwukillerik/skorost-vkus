import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    setLoading(true);
    try {
      const loggedIn = await login(email, password);
      toast.success("Добро пожаловать!");
      navigate(loggedIn.role === "ADMIN" ? "/admin" : from);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto px-4 py-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Вход</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Вход..." : "Войти"}
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Нет аккаунта?{" "}
              <Link to="/register" className="text-primary font-semibold">
                Зарегистрироваться
              </Link>
            </p>
            <p className="text-center text-xs text-muted-foreground mt-2">
              Демо: user@example.com / user123
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
