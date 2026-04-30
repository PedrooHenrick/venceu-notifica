import { Link, Navigate } from "react-router-dom";
import { BellRing, CalendarClock, ArrowRight, CheckCircle2, Building2, Users, Mail, Clock, Gift, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
export default function Landing() {
  const { user, loading } = useAuth();
  if (!loading && user) return <Navigate to="/dashboard" replace />;
  const empresasParceiras = [
    { nome: "Empresa 1", logo: "/logos/empresa1.png" },
    { nome: "Empresa 2", logo: "/logos/empresa2.png" },
    { nome: "Empresa 3", logo: "/logos/empresa3.png" },
    { nome: "Empresa 4", logo: "/logos/empresa4.png" },
    { nome: "Empresa 5", logo: "/logos/empresa5.png" },
  ];
  const features = [
    { 
      icon: BellRing, 
      title: "Alertas automáticos", 
      desc: "Receba emails antes do vencimento. Nunca mais olhe planilhas todo dia.", 
      color: "text-orange-600",
      bg: "bg-orange-50"
    },
    { 
      icon: CalendarClock, 
      title: "Controle de prazos", 
      desc: "Veja num relance documentos a vencer em 7, 15 ou 30 dias.", 
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    { 
      icon: CreditCard, 
      title: "R$ 20/mês", 
      desc: "Preço justo, teste grátis de 7 dias. Cancele quando quiser.", 
      color: "text-green-600",
      bg: "bg-green-50"
    },
  ];
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="mx-auto flex max-w-6xl items-center justify-between flex-wrap gap-4 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xl overflow-hidden">
            <img 
              src="/sua-logo-aqui.png" 
              alt="Venciofy" 
              className="h-full w-auto object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = document.createElement('span');
                fallback.textContent = 'V';
                e.currentTarget.parentElement?.appendChild(fallback);
              }}
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">Venciofy</span>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="ghost" className="text-gray-600 hover:text-gray-900">
            <Link to="/auth">Entrar</Link>
          </Button>
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
            <Link to="/auth?mode=signup">Começar grátis</Link>
          </Button>
        </div>
      </header>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5">
              <Gift className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">7 dias grátis • Sem compromisso</span>
            </div>
            
            <h1 className="mt-5 text-3xl font-bold leading-tight text-gray-900 md:text-4xl lg:text-5xl">
              Pare de perder noite de sono com{' '}
              <span className="text-blue-600">documentos vencendo</span>
            </h1>
            
            <p className="mt-5 text-lg text-gray-600">
              Cadastre funcionários e documentos uma vez. O sistema avisa antes de vencer.
            </p>
            <div className="mt-5 rounded-xl bg-blue-50 p-4 border border-blue-100">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">R$ 20</span>
                <span className="text-gray-600">/mês</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">Acessível, cancele quando quiser.</p>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Link to="/auth?mode=signup">Testar grátis <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
            
            <div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-green-500" /> 7 dias grátis</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-green-500" /> Cancele a qualquer momento</span>
            </div>
          </div>
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=500&fit=crop" 
              alt="Equipe trabalhando"
              className="rounded-xl w-full h-auto object-cover shadow-sm"
              loading="lazy"
            />
            <div className="absolute -bottom-3 -left-3 rounded-lg bg-white p-2 shadow-md text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span>Alertas por email</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Empresas parceiras */}
      <section className="border-y border-gray-100 py-10">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-center text-sm font-medium uppercase tracking-wide text-gray-400">
            Empresas que confiam no Venciofy
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6">
            {empresasParceiras.map((empresa) => (
              <div key={empresa.nome} className="h-10 flex items-center justify-center px-4 text-gray-500 text-sm">
                {empresa.logo ? (
                  <img src={empresa.logo} alt={empresa.nome} className="h-full object-contain" />
                ) : (
                  empresa.nome
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Como funciona */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
            Como funciona em 3 passos
          </h2>
          <p className="mx-auto mt-3 text-gray-600">
            Simples e direto, sem complicação
          </p>
        </div>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {[
            { icon: Users, title: "Cadastre funcionários", desc: "Adicione colaboradores em poucos cliques", bg: "bg-blue-50" },
            { icon: CalendarClock, title: "Insira datas de documentos", desc: "ASO, NR, treinamentos - cadastre uma vez", bg: "bg-indigo-50" },
            { icon: Mail, title: "Receba alertas", desc: "Email automático antes do vencimento", bg: "bg-green-50" },
          ].map((step, i) => (
            <div key={step.title} className="text-center">
              <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-xl ${step.bg} text-blue-600`}>
                <step.icon className="h-7 w-7" />
              </div>
              <h3 className="mt-3 text-lg font-semibold text-gray-900">{i+1}. {step.title}</h3>
              <p className="mt-1 text-gray-600 text-sm">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>
      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 pb-14">
        <div className="grid gap-5 md:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border border-gray-100 bg-white p-5">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${f.bg} ${f.color}`}>
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-base font-semibold text-gray-900">{f.title}</h3>
              <p className="mt-1 text-gray-600 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
      {/* Preço */}
      <section className="bg-blue-50 py-12">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
            Teste grátis por 7 dias
          </h2>
          <p className="mt-3 text-gray-600">
            Depois apenas <span className="font-bold text-blue-600">R$ 20/mês</span> • Sem fidelidade
          </p>
          <Button asChild className="mt-6 bg-blue-600 hover:bg-blue-700">
            <Link to="/auth?mode=signup">Começar teste grátis</Link>
          </Button>
        </div>
      </section>
      {/* FAQ */}
      <section className="mx-auto max-w-4xl px-6 py-14">
        <h2 className="text-xl font-bold text-center text-gray-900 mb-6">
          Dúvidas comuns
        </h2>
        <div className="divide-y divide-gray-200">
          <div className="py-4">
            <h3 className="font-medium text-gray-900">Como funciona o teste grátis?</h3>
            <p className="text-gray-600 mt-1 text-sm">7 dias de acesso total sem custo. Depois, R$ 20/mês se quiser continuar.</p>
          </div>
          <div className="py-4">
            <h3 className="font-medium text-gray-900">Como recebo alertas?</h3>
            <p className="text-gray-600 mt-1 text-sm">Por email, automaticamente quando o documento estiver perto de vencer.</p>
          </div>
          <div className="py-4">
            <h3 className="font-medium text-gray-900">Posso cancelar quando quiser?</h3>
            <p className="text-gray-600 mt-1 text-sm">Sim, sem multas ou burocracia, direto pelo sistema.</p>
          </div>
        </div>
      </section>
    </div>
  );
}