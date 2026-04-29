import { Link, Navigate } from "react-router-dom";
import { ShieldCheck, BellRing, CalendarClock, FileCheck2, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function Landing() {
  const { user, loading } = useAuth();
  if (!loading && user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-hero text-primary-foreground shadow-soft">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span className="font-bold tracking-tight">Venciofy</span>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="ghost"><Link to="/auth">Entrar</Link></Button>
          <Button asChild><Link to="/auth?mode=signup">Começar grátis</Link></Button>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-16 text-center md:py-24">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft">
          <span className="h-1.5 w-1.5 rounded-full bg-status-ok" />
          Simples como uma planilha. Inteligente como um assistente.
        </span>
        <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
          Nunca mais seja pego de surpresa por um <span className="bg-gradient-hero bg-clip-text text-transparent">documento vencido</span>.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Controle os vencimentos de ASOs, NRs, ABVCB, licenças e treinamentos das suas empresas e funcionários em um só lugar — com alertas claros, do jeito que deveria ser.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="gap-2">
            <Link to="/auth?mode=signup">Começar agora <ArrowRight className="h-4 w-4" /></Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/auth">Já tenho conta</Link>
          </Button>
        </div>
        <div className="mx-auto mt-6 flex max-w-md flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-status-ok" /> Sem cartão</span>
          <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-status-ok" /> Cadastro em 30s</span>
          <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-status-ok" /> Multi-empresas</span>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-4 px-6 pb-24 md:grid-cols-3">
        {[
          { icon: CalendarClock, title: "Visão clara dos prazos", desc: "Veja o que vence em 7, 15 e 30 dias num painel objetivo." },
          { icon: BellRing, title: "Alertas automáticos", desc: "Saiba antes do problema. Nada de planilha desatualizada." },
          { icon: FileCheck2, title: "Documentos centralizados", desc: "Funcionários e empresa, tudo num só lugar — fácil de cadastrar." },
        ].map((f) => (
          <div key={f.title} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
