import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

export default function PagamentoSucesso() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate("/planos?paid=1"), 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pagamento confirmado!</h1>
        <p className="text-gray-500 mb-1">Seu plano PRO está ativo por 30 dias.</p>
        <p className="text-sm text-gray-400">Você será redirecionado em instantes...</p>

        <button
          onClick={() => navigate("/planos?paid=1")}
          className="mt-8 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          Ir para o painel
        </button>
      </div>
    </div>
  );
}