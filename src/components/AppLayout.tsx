import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Building2, Users, FileText, BarChart3, LogOut, ShieldCheck, Lock, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/dashboard", label: "Painel", icon: LayoutDashboard },
  { to: "/empresas", label: "Empresas", icon: Building2 },
  { to: "/funcionarios", label: "Funcionários", icon: Users },
  { to: "/documentos-empresa", label: "Doc. Empresa", icon: FileText },
  { to: "/relatorios", label: "Relatórios", icon: BarChart3 },
];

function Paywall({ userEmail, userId }: { userEmail: string; userId: string }) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Usuário não autenticado");

      const response = await fetch(
        "https://wcopsrcnxzdwrbhykmgu.supabase.co/functions/v1/create-checkout-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            priceId: import.meta.env.VITE_STRIPE_PRICE_ID,
            customerEmail: userEmail,
            clientReferenceId: userId,
            successUrl: `${window.location.origin}/dashboard?payment=success`,
            cancelUrl: `${window.location.origin}/dashboard?payment=canceled`,
          }),
        }
      );

      const { url, error } = await response.json();
      if (error) throw new Error(error);
      if (!url) throw new Error("URL não retornada");

      window.location.href = url;

    } catch (err: any) {
      console.error(err);
      alert("Erro ao abrir o checkout. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 backdrop-blur-sm bg-background/60" />
      <div className="relative z-10 mx-4 w-full max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Lock className="h-7 w-7 text-primary" />
        </div>

        <h2 className="text-xl font-semibold tracking-tight">Seu período gratuito encerrou</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Seus 7 dias grátis chegaram ao fim. Para continuar usando o sistema sem interrupções, assine o plano mensal.
        </p>

        <div className="my-6 rounded-lg border border-border bg-secondary/50 p-4">
          <div className="text-3xl font-bold text-foreground">
            R$ 20
            <span className="text-base font-normal text-muted-foreground">/mês</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Acesso completo · Renovação automática · Cancele quando quiser
          </p>
        </div>

        <Button className="w-full" size="lg" onClick={handleCheckout} disabled={loading}>
          {loading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Aguarde...</>
          ) : (
            "Assinar agora — R$ 20/mês"
          )}
        </Button>

        <p className="mt-3 text-[11px] text-muted-foreground">
          Pagamento seguro via Stripe · Cartão de crédito
        </p>
      </div>
    </div>
  );
}

export default function AppLayout() {
  const { user, signOut } = useAuth();
  const { isBlocked, isTrial, daysLeft } = useSubscription();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-[15px] font-semibold tracking-tight">Venciofy</span>
          </div>
          <div className="flex items-center gap-3">
            {isTrial && (
              <span className="hidden rounded-sm bg-amber-500/20 px-2 py-0.5 text-[11px] font-medium text-amber-200 sm:inline">
                {daysLeft} {daysLeft === 1 ? "dia" : "dias"} grátis restantes
              </span>
            )}
            <span className="hidden text-xs text-primary-foreground/80 sm:inline">{user?.email}</span>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 gap-1.5 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              onClick={async () => { await signOut(); navigate("/auth"); }}
            >
              <LogOut className="h-3.5 w-3.5" /> Sair
            </Button>
          </div>
        </div>
      </header>

      {isTrial && daysLeft <= 3 && (
        <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center text-xs text-amber-700 dark:text-amber-300">
          ⚠️ Seu período gratuito encerra em <strong>{daysLeft} {daysLeft === 1 ? "dia" : "dias"}</strong>. Assine para continuar usando sem interrupções.
        </div>
      )}

      <div className="mx-auto flex max-w-[1400px]">
        <aside className="hidden w-56 shrink-0 border-r border-border bg-card md:block">
          <nav className="py-2">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2.5 border-l-[3px] px-4 py-2.5 text-[13px] font-medium transition-colors",
                    isActive
                      ? "border-primary bg-primary-soft text-primary"
                      : "border-transparent text-foreground/70 hover:bg-secondary hover:text-foreground"
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="relative min-w-0 flex-1">
          <div className="px-4 py-5 pb-24 md:px-6 md:py-6">
            <Outlet />
          </div>

          {isBlocked && (
            <Paywall
              userEmail={user?.email ?? ""}
              userId={user?.id ?? ""}
            />
          )}
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-5 border-t border-border bg-card md:hidden">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium",
                isActive ? "text-primary" : "text-muted-foreground"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}