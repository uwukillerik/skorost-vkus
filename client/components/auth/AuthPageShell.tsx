import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Home, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileBottomNav } from "@/components/MobileBottomNav";

interface AuthPageShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function AuthPageShell({ title, subtitle, children }: AuthPageShellProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh overflow-x-hidden bg-background bg-[radial-gradient(ellipse_at_top,hsl(32_40%_94%),transparent_55%)]">
      <header
        className="sticky top-0 z-50 bg-card/92 backdrop-blur-lg border-b border-border/50 shadow-sm safe-area-pt"
      >
        <div className="flex items-center justify-between h-14 px-2 sm:px-3 gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl shrink-0 h-10 w-10"
            onClick={() => navigate(-1)}
            aria-label="Назад"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex-1 min-w-0 text-center px-1">
            <p className="font-bold text-base leading-tight truncate">{title}</p>
            {subtitle && (
              <p className="text-[11px] text-muted-foreground truncate">{subtitle}</p>
            )}
          </div>

          <div className="flex items-center shrink-0">
            <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10" asChild>
              <Link to="/" aria-label="На главную">
                <Home className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10" asChild>
              <Link to="/menu" aria-label="В меню">
                <UtensilsCrossed className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="page-with-bottom-nav min-w-0 w-full px-4 py-6 sm:py-8">
        <div className="max-w-md mx-auto w-full">{children}</div>
      </main>

      <MobileBottomNav />
    </div>
  );
}
