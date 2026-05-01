import { Link, Navigate } from "react-router-dom";
import {
  BellRing, CalendarClock, ArrowRight, CheckCircle2,
  Building2, Users, Mail, Clock, Gift, CreditCard, ShieldCheck, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function Landing() {
  const { user, loading } = useAuth();
  if (!loading && user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* ────────────────── HEADER ────────────────── */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <span className="text-sm font-bold text-white">v</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900">Venciofy</span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 hidden sm:inline-flex">
              <Link to="/auth">Entrar</Link>
            </Button>
            <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4">
              <Link to="/auth?mode=signup">Testar gratis</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ────────────────── HERO ────────────────── */}
      <section className="mx-auto max-w-6xl px-5 pt-14 pb-10 md:pt-20 md:pb-16">
        <div className="grid items-center gap-12 md:grid-cols-2">
          {/* Texto */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700">
              <Gift className="h-3.5 w-3.5" />
              7 dias gratis, sem cartao
            </div>

            <h1 className="mt-5 text-[2rem] font-extrabold leading-[1.15] tracking-tight text-gray-900 md:text-[2.75rem]">
              Chega de levar multa<br />
              por <span className="text-blue-600">documento vencido.</span>
            </h1>

            <p className="mt-4 text-base leading-relaxed text-gray-500 md:text-lg">
              Cadastre funcionarios e documentos uma vez.
              O Venciofy avisa antes de vencer — por email, automaticamente.
            </p>

            <div className="mt-6 inline-flex flex-col rounded-xl border border-blue-100 bg-blue-50 px-5 py-4">
              <span className="text-2xl font-extrabold text-gray-900">
                R$ 20<span className="text-base font-normal text-gray-500">/mes</span>
              </span>
              <span className="mt-0.5 text-sm text-gray-500">Cancele quando quiser. Sem fidelidade.</span>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white gap-2 px-6">
                <Link to="/auth?mode=signup">
                  Comecar teste gratis <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="gap-2">
                <Link to="/auth">Ja tenho conta</Link>
              </Button>
            </div>

            <div className="mt-5 flex flex-wrap gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-green-500" /> Sem cartao para testar</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-green-500" /> Cancele a qualquer momento</span>
            </div>
          </div>

          {/* Imagem + floating card */}
          <div className="relative">
            <div className="overflow-hidden rounded-2xl shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=700&h=500&fit=crop&q=80"
                alt="Equipe de RH organizando documentos"
                className="h-72 w-full object-cover md:h-96"
                loading="lazy"
              />
            </div>
            {/* Card flutuante - alerta */}
            <div className="absolute -bottom-4 -left-4 flex items-center gap-3 rounded-xl border border-orange-100 bg-white px-4 py-3 shadow-lg">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-50">
                <BellRing className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-800">NR-10 vence em 3 dias</p>
                <p className="text-[11px] text-gray-400">Joazinho — Empresa ABC</p>
              </div>
            </div>
            {/* Card flutuante - ok */}
            <div className="absolute -top-4 -right-4 hidden items-center gap-3 rounded-xl border border-green-100 bg-white px-4 py-3 shadow-lg sm:flex">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-50">
                <ShieldCheck className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-800">Tudo em dia</p>
                <p className="text-[11px] text-gray-400">12 documentos ativos</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────── PROBLEMA ────────────────── */}
      <section className="bg-gray-950 py-14">
        <div className="mx-auto max-w-4xl px-5 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">O problema real</p>
          <h2 className="mt-3 text-2xl font-bold text-white md:text-3xl">
            Quantas vezes voce ja passou por isso?
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { emoji: "😰", text: "Levou multa por ASO vencido que estava numa planilha perdida" },
              { emoji: "😤", text: "So descobriu que o NR venceu quando o fiscal apareceu na empresa" },
              { emoji: "📋", text: "Tem que verificar manualmente dezenas de documentos toda semana" },
            ].map((item) => (
              <div key={item.text} className="rounded-xl border border-white/10 bg-white/5 p-5 text-left">
                <span className="text-2xl">{item.emoji}</span>
                <p className="mt-3 text-sm leading-relaxed text-gray-300">{item.text}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-base text-gray-400">
            O Venciofy resolve isso. Uma vez cadastrado, o sistema cuida do resto.
          </p>
        </div>
      </section>

      {/* ────────────────── COMO FUNCIONA ────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">Como funciona</p>
          <h2 className="mt-2 text-2xl font-bold text-gray-900 md:text-3xl">3 passos, sem complicacao</h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              step: "01",
              icon: Users,
              title: "Cadastre funcionarios",
              desc: "Adicione colaboradores com CPF, cargo e empresa em poucos cliques.",
              img: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&h=250&fit=crop&q=80",
              alt: "Pessoas em reuniao de trabalho"
            },
            {
              step: "02",
              icon: CalendarClock,
              title: "Insira as DATAS",
              desc: "ASO, NR-10, NR-33, AVCB — cadastre data de emissao e vencimento.",
              img: "/images/doc2.png",
              alt: "Documentos e contratos em mesa"
            },
            {
              step: "03",
              icon: Mail,
              title: "Receba alertas",
              desc: "Email automatico antes de vencer. Sem planilha, sem esquecimento.",
              img: "/images/doc3.jpg",
              alt: "Pessoa recebendo notificacao no celular"
            },
          ].map((item) => (
            <div key={item.step} className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
              <div className="overflow-hidden">
                <img
                  src={item.img}
                  alt={item.alt}
                  className="h-40 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black text-blue-100">{item.step}</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                    <item.icon className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <h3 className="mt-2 text-base font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ────────────────── FEATURES ────────────────── */}
      <section className="bg-blue-50 py-14">
        <div className="mx-auto max-w-6xl px-5">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">Recursos</p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900 md:text-3xl">Tudo que voce precisa</h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: BellRing, title: "Alertas automaticos", desc: "Email antes de vencer. Nunca mais olhe planilha todo dia.", color: "bg-orange-100 text-orange-600" },
              { icon: CalendarClock, title: "Painel visual", desc: "Vencidos, urgentes e a vencer num so lugar, tudo claro.", color: "bg-blue-100 text-blue-600" },
              { icon: Building2, title: "Por empresa", desc: "Organize documentos por funcionario ou por empresa.", color: "bg-indigo-100 text-indigo-600" },
              { icon: Zap, title: "Rapido de usar", desc: "Cadastre um funcionario em menos de 1 minuto.", color: "bg-yellow-100 text-yellow-600" },
              { icon: ShieldCheck, title: "Seus dados protegidos", desc: "Hospedagem segura, seus dados nao sao compartilhados.", color: "bg-green-100 text-green-600" },
              { icon: CreditCard, title: "Preço justo", desc: "R$ 20/mes. Menos que um almoco. Vale cada centavo.", color: "bg-pink-100 text-pink-600" },
            ].map((f) => (
              <div key={f.title} className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${f.color}`}>
                  <f.icon className="h-4 w-4" />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────── PRECO ────────────────── */}
      <section className="mx-auto max-w-4xl px-5 py-16 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">Preço</p>
        <h2 className="mt-2 text-2xl font-bold text-gray-900 md:text-3xl">Simples e transparente</h2>

        <div className="mx-auto mt-8 max-w-sm overflow-hidden rounded-2xl border-2 border-blue-600 bg-white shadow-lg">
          <div className="bg-blue-600 py-3 text-sm font-semibold text-white">Plano unico • Sem surpresas</div>
          <div className="px-8 py-8">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-extrabold text-gray-900">R$ 20</span>
              <span className="text-gray-500">/mes</span>
            </div>
            <ul className="mt-6 space-y-3 text-sm text-gray-600">
              {[
                "Funcionarios e documentos ilimitados",
                "Alertas por email automaticos",
                "Painel de vencimentos",
                "Relatorios exportaveis (CSV/PDF)",
                "7 dias gratis para testar",
                "Cancele quando quiser",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                  {item}
                </li>
              ))}
            </ul>
            <Button asChild className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white">
              <Link to="/auth?mode=signup">Comecar teste gratis</Link>
            </Button>
            <p className="mt-3 text-xs text-gray-400">Sem cartao de credito para testar</p>
          </div>
        </div>
      </section>

      {/* ────────────────── FAQ ────────────────── */}
      <section className="border-t border-gray-100 bg-gray-50 py-14">
        <div className="mx-auto max-w-2xl px-5">
          <h2 className="text-center text-xl font-bold text-gray-900">Duvidas comuns</h2>
          <div className="mt-8 divide-y divide-gray-200">
            {[
              { q: "Como funciona o teste gratis?", a: "7 dias de acesso total sem nenhum custo. Depois, R$ 20/mes se quiser continuar." },
              { q: "Como recebo os alertas?", a: "Por email, automaticamente quando um documento estiver perto de vencer." },
              { q: "Posso cancelar quando quiser?", a: "Sim, sem multa, sem burocracia, direto pelo sistema." },
              { q: "Precisa instalar alguma coisa?", a: "Nao. O Venciofy roda direto no navegador, no celular ou computador." },
            ].map((item) => (
              <div key={item.q} className="py-5">
                <h3 className="text-sm font-semibold text-gray-900">{item.q}</h3>
                <p className="mt-1.5 text-sm text-gray-500">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────── CTA FINAL ────────────────── */}
      <section className="bg-blue-600 py-16 text-center">
        <div className="mx-auto max-w-2xl px-5">
          <h2 className="text-2xl font-bold text-white md:text-3xl">
            Comece a usar hoje. Gratis por 7 dias.
          </h2>
          <p className="mt-3 text-blue-100">
            Sem burocracia. So resultados.
          </p>
          <Button asChild size="lg" className="mt-7 bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8">
            <Link to="/auth?mode=signup">
              Criar conta gratis <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ────────────────── FOOTER ────────────────── */}
      <footer className="border-t border-gray-100 py-8 text-center text-xs text-gray-400">
        <p>© 2025 Venciofy. Feito para quem nao tem tempo a perder.</p>
      </footer>
    </div>
  );
}