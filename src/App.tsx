import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "./pages/NotFound.tsx";
import Landing from "./pages/Landing";
import AuthPage from "./pages/Auth";
import ResetPasswordPage from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Companies from "./pages/Companies";
import Employees from "./pages/Employees";
import EmployeeDetail from "./pages/EmployeeDetail";
import CompanyDocuments from "./pages/CompanyDocuments";
import Reports from "./pages/Reports";
import Planos from "./pages/Planos";
import PagamentoSucesso from "./pages/PagamentoSucesso";
import PrivacyPage from "./pages/Privacy";
import AppLayout from "./components/AppLayout";
import RequireAuth from "./components/RequireAuth";
import { SubscriptionGuard } from "./components/SubscriptionGuard";
import { AuthProvider } from "./hooks/useAuth";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Públicas */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />

            {/* Requer auth, mas sem guard de subscription */}
            <Route path="/planos" element={<RequireAuth><Planos /></RequireAuth>} />
            <Route path="/pagamento/sucesso" element={<PagamentoSucesso />} />

            {/* Requer auth + subscription ativa */}
            <Route element={
              <RequireAuth>
                <SubscriptionGuard>
                  <AppLayout />
                </SubscriptionGuard>
              </RequireAuth>
            }>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/empresas" element={<Companies />} />
              <Route path="/funcionarios" element={<Employees />} />
              <Route path="/funcionarios/:id" element={<EmployeeDetail />} />
              <Route path="/documentos-empresa" element={<CompanyDocuments />} />
              <Route path="/relatorios" element={<Reports />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;