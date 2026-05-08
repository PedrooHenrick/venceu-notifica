import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Check, ArrowRight, Loader2, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const freeFeatures = [
  "Até 2 empresas",
  "Até 5 funcionários por empresa",
  "Até 20 PDFs processados",
  "Alertas por email",
  "Painel de vencimentos",
];

const proFeatures = [
  "Empresas ilimitadas",
  "Funcionários ilimitados",
  "PDFs ilimitados",
  "Alertas por email",
  "Painel de vencimentos",
  "Suporte prioritário",
];

export default function Planos() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status"); // "failure" | "pending" | null
  const justPaid = searchParams.get("paid") === "1"; // vindo do PaymentSuccess

  const [loadingTrial, setLoadingTrial] = useState(false);
  const [loadingPro, setLoadingPro] = useState(false);

  const handleComecарTeste = async () => {
    setLoadingTrial(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth"); return; }
      await (supabase as any)
        .from("subscriptions")
        .upsert({ user_id: user.id }, { onConflict: "user_id" });
      navigate("/dashboard");
    } catch {
      toast.error("Erro ao iniciar. Tente novamente.");
    } finally {
      setLoadingTrial(false);
    }
  };

  const handleAssinar = async () => {
    setLoadingPro(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok || !data.init_point) {
        toast.error("Erro ao iniciar pagamento. Tente novamente.");
        return;
      }

      window.location.href = data.init_point;
    } catch {
      toast.error("Erro ao conectar. Tente novamente.");
    } finally {
      setLoadingPro(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">

        {/* ── Mensagem pós-pagamento ── */}
        {justPaid && (
          <div className="mb-8 rounded-2xl border border-green-200 bg-green-50 px-6 py-5 text-center">
            <div className="flex justify-center mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Heart className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <h2 className="text-base font-bold text-green-800">Obrigado por assinar o UniDatas! 💚</h2>
            <p className="mt-1.5 text-sm text-green-700 max-w-md mx-auto">
              Com sua assinatura, você nos ajuda a manter o sistema no ar, lançar novas funcionalidades e crescer juntos. Cada plano ativo faz diferença real para a comunidade.
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
            >
              Ir para o painel <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ── Alerta de falha/pendente ── */}
        {status === "failure" && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
            O pagamento não foi aprovado. Tente novamente ou use outro método.
          </div>
        )}
        {status === "pending" && (
          <div className="mb-6 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-center text-sm text-yellow-700">
            Seu pagamento está pendente. Assim que confirmado, seu plano será ativado automaticamente.
          </div>
        )}

        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Escolha seu plano</h1>
          <p className="mt-2 text-gray-500">Comece grátis, assine quando quiser.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 items-start">
          {/* ── Card TESTE ── */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8 flex flex-col">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 text-center mb-4">
              Teste
            </p>
            <div className="text-center mb-2">
              <span className="text-5xl font-serif font-bold text-gray-900">Grátis</span>
            </div>
            <p className="text-sm text-gray-400 text-center mb-8">por 7 dias, sem cartão</p>

            <ul className="space-y-3 flex-1 mb-8">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-gray-700">
                  <Check className="h-4 w-4 shrink-0 text-green-500" />
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={handleComecарTeste}
              disabled={loadingTrial}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 py-3.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60 transition-colors"
            >
              {loadingTrial ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Aguarde...</>
              ) : (
                <>Começar teste <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </div>

          {/* ── Card PRO ── */}
          <div className="relative rounded-2xl border-2 border-blue-500 bg-gray-900 p-8 flex flex-col">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="rounded-full bg-blue-600 px-4 py-1 text-[11px] font-bold uppercase tracking-widest text-white">
                Mais popular
              </span>
            </div>

            <p className="text-[11px] font-bold uppercase tracking-widest text-blue-400 text-center mb-4 mt-2">
              Pro
            </p>

            <div className="text-center mb-2 flex items-end justify-center gap-1">
              <span className="text-5xl font-serif font-bold text-white leading-none">R$24</span>
              <span className="text-lg text-gray-300 mb-1">,90/mês</span>
            </div>
            <p className="text-sm text-gray-400 text-center mb-8">tudo liberado, sem limite</p>

            <ul className="space-y-3 flex-1 mb-8">
              {proFeatures.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-gray-200">
                  <Check className="h-4 w-4 shrink-0 text-blue-400" />
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={handleAssinar}
              disabled={loadingPro}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {loadingPro ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Aguarde...</>
              ) : (
                <>Assinar agora <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}