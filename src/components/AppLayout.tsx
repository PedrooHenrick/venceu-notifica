import { useState, useRef, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Building2, Users, FileText,
  BarChart3, LogOut, HelpCircle,
  MessageSquare, Trash2, Settings, X, CreditCard, UserCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const nav = [
  { to: "/dashboard",          label: "Painel",                icon: LayoutDashboard },
  { to: "/empresas",           label: "Empresas",              icon: Building2 },
  { to: "/funcionarios",       label: "Funcionários",          icon: Users },
  { to: "/documentos-empresa", label: "Documentos",            icon: FileText },
  { to: "/relatorios",         label: "Relatórios",            icon: BarChart3 },
];

async function callFunction(name: string, body?: object) {
  const { data: { session } } = await supabase.auth.getSession();
  return fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${name}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    }
  );
}

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl">
        {children}
      </div>
    </div>
  );
}

function FeedbackModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await callFunction("send-feedback", { message: text.trim() });
      if (res.ok) { setText(""); onClose(); toast.success("Feedback enviado! Obrigado 🙏"); }
      else toast.error("Erro ao enviar feedback.");
    } catch { toast.error("Erro ao enviar feedback."); }
    finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          <h2 className="text-base font-semibold">Enviar feedback</h2>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
      </div>
      <p className="text-sm text-gray-500 mb-3">Tem alguma sugestão, elogio ou problema? Nos conta!</p>
      <textarea
        value={text} onChange={(e) => setText(e.target.value)}
        placeholder="Escreva aqui o seu feedback..." rows={4}
        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={onClose} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors">Cancelar</button>
        <button onClick={handleSend} disabled={!text.trim() || loading}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {loading ? "Enviando..." : "Enviar"}
        </button>
      </div>
    </Modal>
  );
}

function DeleteAccountModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (confirm !== "EXCLUIR") return;
    setLoading(true);
    try {
      const res = await callFunction("delete-account");
      if (res.ok) { await supabase.auth.signOut(); navigate("/"); toast.success("Conta excluída com sucesso."); }
      else { const data = await res.json(); toast.error(data?.error ?? "Erro ao excluir conta."); setLoading(false); }
    } catch { toast.error("Erro ao excluir conta."); setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trash2 className="h-5 w-5 text-red-500" />
          <h2 className="text-base font-semibold text-red-600">Excluir conta</h2>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
      </div>
      <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 mb-4">
        <p className="text-sm font-medium text-red-700">⚠️ Esta ação é irreversível.</p>
        <p className="text-xs text-red-600 mt-0.5">Todos os seus dados serão permanentemente apagados.</p>
      </div>
      <p className="text-sm text-gray-500 mb-2">Para confirmar, digite <span className="font-semibold text-gray-900">EXCLUIR</span> abaixo:</p>
      <input value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="EXCLUIR"
        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={onClose} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors">Cancelar</button>
        <button onClick={handleDelete} disabled={confirm !== "EXCLUIR" || loading}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-40 transition-colors">
          {loading ? "Excluindo..." : "Excluir minha conta"}
        </button>
      </div>
    </Modal>
  );
}

// ── Linha de plano ────────────────────────────────────────────────────────────

function PlanRow({ onNavigate }: { onNavigate: () => void }) {
  const { isLoading, isTrial, isBlocked, daysLeft } = useSubscription();
  if (isLoading) return null;

  const isPro = !isTrial && !isBlocked;

  if (isPro) {
    return (
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <CreditCard className="h-4 w-4 text-green-500 shrink-0" />
        <span className="text-[13px] text-gray-700 flex-1">Plano Pro</span>
        <span className="flex items-center gap-1 text-[11px] font-semibold text-green-600">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block" />
          Ativo
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={onNavigate}
      className={cn(
        "flex w-full items-center gap-2.5 px-3 py-2.5 transition-colors",
        isBlocked ? "hover:bg-red-50" : "hover:bg-yellow-50"
      )}
    >
      <CreditCard className={cn("h-4 w-4 shrink-0", isBlocked ? "text-red-500" : "text-yellow-500")} />
      <div className="flex-1 text-left">
        <p className={cn("text-[13px] font-medium", isBlocked ? "text-red-600" : "text-yellow-700")}>
          {isBlocked ? "Plano expirado" : "Período de teste"}
        </p>
        <p className={cn("text-[11px]", isBlocked ? "text-red-400" : "text-yellow-600")}>
          {isBlocked ? "Clique para renovar" : `${daysLeft} dias restantes · Atualizar`}
        </p>
      </div>
    </button>
  );
}

// ── Drawer mobile ─────────────────────────────────────────────────────────────

function MobileDrawer({ open, onClose, displayName, onSignOut, onFeedback, onDeleteAccount }: {
  open: boolean;
  onClose: () => void;
  displayName: string;
  onSignOut: () => void;
  onFeedback: () => void;
  onDeleteAccount: () => void;
}) {
  const navigate = useNavigate();

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity md:hidden",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-white shadow-xl transition-transform duration-300 md:hidden",
          open ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-gray-200" />
        </div>

        {/* Avatar + nome */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[15px] font-bold text-white">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-[14px] font-semibold text-gray-900">{displayName}</p>
            <p className="text-[12px] text-gray-500">Administrador</p>
          </div>
        </div>

        {/* Plano */}
        <div className="border-b border-gray-100">
          <p className="px-5 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Plano</p>
          <PlanRow onNavigate={() => { navigate("/planos"); onClose(); }} />
        </div>

        {/* Ações */}
        <div className="border-b border-gray-100">
          <p className="px-5 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Configurações</p>
          <button
            onClick={() => { onFeedback(); onClose(); }}
            className="flex w-full items-center gap-3 px-5 py-3 text-[14px] text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <MessageSquare className="h-4 w-4 text-blue-500" />
            Enviar feedback
          </button>
          <button
            onClick={() => { onDeleteAccount(); onClose(); }}
            className="flex w-full items-center gap-3 px-5 py-3 text-[14px] text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Excluir conta
          </button>
        </div>

        {/* Sair */}
        <button
          onClick={() => { onSignOut(); onClose(); }}
          className="flex w-full items-center gap-3 px-5 py-3 text-[14px] text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <LogOut className="h-4 w-4 text-gray-400" />
          Sair
        </button>

        {/* Espaço pro safe area do iPhone */}
        <div className="h-6" />
      </div>
    </>
  );
}

// ── Menu desktop do usuário ───────────────────────────────────────────────────

function UserMenu({ displayName, onSignOut, onFeedback, onDeleteAccount }: {
  displayName: string;
  onSignOut: () => void;
  onFeedback: () => void;
  onDeleteAccount: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative border-t border-gray-100 px-3 py-3">
      {open && (
        <div className="absolute bottom-full left-3 right-3 mb-2 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Configurações</p>
          </div>
          <PlanRow onNavigate={() => { navigate("/planos"); setOpen(false); }} />
          <div className="border-t border-gray-100">
            <button
              onClick={() => { onFeedback(); setOpen(false); }}
              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <MessageSquare className="h-4 w-4 text-blue-500" />
              Enviar feedback
            </button>
            <button
              onClick={() => { onDeleteAccount(); setOpen(false); }}
              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-[13px] text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Excluir conta
            </button>
          </div>
          <div className="border-t border-gray-100">
            <button
              onClick={() => { onSignOut(); setOpen(false); }}
              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <LogOut className="h-4 w-4 text-gray-400" />
              Sair
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-lg px-2 py-2 transition-colors",
          open ? "bg-gray-100" : "hover:bg-gray-50"
        )}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[13px] font-bold text-white">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1 text-left">
          <p className="truncate text-[13px] font-semibold text-gray-900">{displayName}</p>
          <p className="truncate text-[11px] text-gray-500">Administrador</p>
        </div>
        <Settings className={cn("h-4 w-4 shrink-0 transition-colors", open ? "text-blue-600" : "text-gray-400")} />
      </button>
    </div>
  );
}

// ── AppLayout ─────────────────────────────────────────────────────────────────

export default function AppLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const displayName = user?.user_metadata?.full_name
    ?? user?.email?.split("@")[0]
    ?? "Usuário";

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-[#f5f6fa]">
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-[1400px] items-center px-4 py-3">
          <span className="text-[16px] font-bold tracking-tight text-gray-900">UniDatas</span>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px]">
        <aside className="hidden w-60 shrink-0 flex-col border-r border-gray-200 bg-white md:flex" style={{ minHeight: "calc(100vh - 57px)" }}>
          <nav className="flex-1 py-3">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "mx-2 mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors",
                    isActive ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={cn("h-4 w-4", isActive ? "text-blue-600" : "text-gray-400")} />
                    {item.label}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="m-3 rounded-xl border border-blue-100 bg-blue-50 p-3">
            <div className="flex items-center gap-2 mb-1">
              <HelpCircle className="h-4 w-4 text-blue-500" />
              <span className="text-[13px] font-semibold text-blue-700">Precisa de ajuda?</span>
            </div>
            <p className="text-[11px] text-blue-600">Fale com o suporte</p>
          </div>

          <UserMenu
            displayName={displayName}
            onSignOut={handleSignOut}
            onFeedback={() => setFeedbackOpen(true)}
            onDeleteAccount={() => setDeleteAccountOpen(true)}
          />
        </aside>

        <main className="relative min-w-0 flex-1">
          <div className="px-4 py-6 pb-24 md:px-6 md:py-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* ── Bottom nav mobile — 6 itens ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-6 border-t border-gray-200 bg-white md:hidden">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium",
                isActive ? "text-blue-600" : "text-gray-400"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}

        {/* 6º botão — perfil */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium text-gray-400"
        >
          <UserCircle className="h-4 w-4" />
          Perfil
        </button>
      </nav>

      {/* Drawer mobile */}
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        displayName={displayName}
        onSignOut={handleSignOut}
        onFeedback={() => setFeedbackOpen(true)}
        onDeleteAccount={() => setDeleteAccountOpen(true)}
      />

      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
      <DeleteAccountModal open={deleteAccountOpen} onClose={() => setDeleteAccountOpen(false)} />
    </div>
  );
}