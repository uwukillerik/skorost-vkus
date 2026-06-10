import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Crown, Copy, Gift, Users } from "lucide-react";
import { toast } from "sonner";

export function LoyaltyCard() {
  const { data, isLoading } = useQuery({
    queryKey: ["loyalty"],
    queryFn: () => api.loyalty.get().then((r) => r.loyalty),
  });

  if (isLoading) {
    return <Skeleton className="h-48 w-full rounded-2xl" />;
  }

  if (!data) return null;

  const referralLink = `${window.location.origin}/register?ref=${data.referralCode}`;
  const progress = data.nextTierAt
    ? Math.min(100, (data.points / data.nextTierAt) * 100)
    : 100;

  const copyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Ссылка скопирована!");
  };

  return (
    <div className="space-y-4">
      <div
        className="rounded-2xl p-5 sm:p-6 text-white shadow-xl overflow-hidden relative"
        style={{
          background: `linear-gradient(135deg, ${data.tierColor} 0%, #1a1a1a 60%)`,
        }}
      >
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="relative flex justify-between items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-80">
              Бонусы «Скорость & Вкус»
            </p>
            <h2 className="text-2xl font-black mt-1 flex items-center gap-2">
              <Crown className="h-7 w-7 text-accent" />
              {data.tierName}
            </h2>
            <p className="text-4xl font-black mt-3">{data.points}</p>
            <p className="text-sm opacity-80">баллов · {data.rateLabel}</p>
          </div>
          <Gift className="h-10 w-10 text-accent opacity-90" />
        </div>
        {data.nextTierAt && (
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1 opacity-90">
              <span>До следующего уровня</span>
              <span>{data.pointsToNext} баллов</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="font-black">Приведи друга</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Вы получите <strong>{data.referralBonusYou} баллов</strong>, друг —{" "}
          <strong>{data.referralBonusFriend}</strong>. Приглашено:{" "}
          {data.referralCount}
        </p>
        <div className="flex gap-2">
          <code className="flex-1 text-xs bg-white border rounded-lg px-3 py-2 truncate font-mono">
            {data.referralCode}
          </code>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={copyReferral}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {data.history.length > 0 && (
        <div className="rounded-2xl bg-card border p-4">
          <p className="font-bold text-sm mb-3">История баллов</p>
          <ul className="space-y-2">
            {data.history.map((h) => (
              <li
                key={h.id}
                className="flex justify-between text-sm border-b pb-2 last:border-0"
              >
                <span className="text-muted-foreground">{h.label}</span>
                <span className="font-bold text-primary">+{h.points}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
