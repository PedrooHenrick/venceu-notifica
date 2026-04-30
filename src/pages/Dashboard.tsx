import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertTriangle, Calendar, CheckCircle2, Clock, ChevronRight, MessageSquare, XCircle, Trash2, X, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { getStatus, formatDaysLeft } from "@/lib/status";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface DocRow {
  id: string;
  name: string;
  expiry_date: string;
  doc_type: string | null;
  employee_id: string | null;
  employee: { id: string; full_name: string; companies: { name: string } } | null;
  company: { name: string } | null;
}

// ─── Helper para chamar Edge Functions autenticadas ───────────
async function callFunction(name: string, body?: object) {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${name}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session?.access_token}`,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    }
  );
  return res;
}

// ─── Modal base ───────────────────────────────────────────────
function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
        {children}
      </div>
    </div>
  );
}

// ─── Modal Feedback ───────────────────────────────────────────
function FeedbackModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await callFunction("send-feedback", { message: text.trim() });
      if (res.ok) {
        setText("");
        onClose();
        toast.success("Feedback enviado! Obrigado 🙏");
      } else {
        toast.error("Erro ao enviar feedback. Tente novamente.");
      }
    } catch {
      toast.error("Erro ao enviar feedback. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold">Enviar feedback</h2>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
      <p className="text-sm text-muted-foreground mb-3">
        Tem alguma sugestão, elogio ou problema? Nos conta!
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Escreva aqui o seu feedback..."
        rows={4}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={onClose}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleSend}
          disabled={!text.trim() || loading}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {loading ? "Enviando..." : "Enviar"}
        </button>
      </div>
    </Modal>
  );
}

// ─── Modal Cancelar Plano ─────────────────────────────────────
function CancelPlanModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    setLoading(true);
    try {
      const res = await callFunction("cancel-subscription");
      if (res.ok) {
        onClose();
        toast.success("Plano cancelado. Seu acesso continua até o fim do período.");
      } else {
        const data = await res.json();
        toast.error(data?.error ?? "Erro ao cancelar plano. Tente novamente.");
      }
    } catch {
      toast.error("Erro ao cancelar plano. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <XCircle className="h-5 w-5 text-status-attention" />
          <h2 className="text-base font-semibold">Cancelar plano</h2>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
      <p className="text-sm text-muted-foreground mb-1">
        Tem certeza que deseja cancelar sua assinatura?
      </p>
      <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
        <li className="flex items-start gap-2">
          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-muted-foreground/50 shrink-0" />
          Seu acesso continua até o fim do período pago.
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-muted-foreground/50 shrink-0" />
          Você não será cobrado novamente.
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-muted-foreground/50 shrink-0" />
          Seus dados ficam salvos por 30 dias após o cancelamento.
        </li>
      </ul>
      <div className="flex justify-end gap-2 mt-6">
        <button
          onClick={onClose}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary transition-colors"
        >
          Manter plano
        </button>
        <button
          onClick={handleCancel}
          disabled={loading}
          className="rounded-lg bg-status-attention px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-colors"
        >
          {loading ? "Cancelando..." : "Sim, cancelar plano"}
        </button>
      </div>
    </Modal>
  );
}

// ─── Modal Excluir Conta ──────────────────────────────────────
function DeleteAccountModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (confirm !== "EXCLUIR") return;
    setLoading(true);
    try {
      const res = await callFunction("delete-account");
      if (res.ok) {
        await supabase.auth.signOut();
        navigate("/");
        toast.success("Conta excluída com sucesso.");
      } else {
        const data = await res.json();
        toast.error(data?.error ?? "Erro ao excluir conta. Tente novamente.");
        setLoading(false);
      }
    } catch {
      toast.error("Erro ao excluir conta. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trash2 className="h-5 w-5 text-red-500" />
          <h2 className="text-base font-semibold text-red-600">Excluir conta</h2>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 mb-4">
        <p className="text-sm font-medium text-red-700">⚠️ Esta ação é irreversível.</p>
        <p className="text-xs text-red-600 mt-0.5">Todos os seus dados, empresas e funcionários serão permanentemente apagados.</p>
      </div>
      <p className="text-sm text-muted-foreground mb-2">
        Para confirmar, digite <span className="font-semibold text-foreground">EXCLUIR</span> abaixo:
      </p>
      <input
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder="EXCLUIR"
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
      />
      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={onClose}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleDelete}
          disabled={confirm !== "EXCLUIR" || loading}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-40 transition-colors"
        >
          {loading ? "Excluindo..." : "Excluir minha conta"}
        </button>
      </div>
    </Modal>
  );
}

// ─── Botão Flutuante ──────────────────────────────────────────
function FloatingMenu({
  onFeedback,
  onCancelPlan,
  onDeleteAccount,
}: {
  onFeedback: () => void;
  onCancelPlan: () => void;
  onDeleteAccount: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
      <div
        className={cn(
          "flex flex-col gap-1.5 transition-all duration-200",
          open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-3 pointer-events-none"
        )}
      >
        <button
          onClick={() => { onFeedback(); setOpen(false); }}
          className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-lg hover:bg-secondary transition-colors whitespace-nowrap"
        >
          <MessageSquare className="h-4 w-4 text-primary" />
          Enviar feedback
        </button>
        <button
          onClick={() => { onCancelPlan(); setOpen(false); }}
          className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-lg hover:bg-secondary transition-colors whitespace-nowrap"
        >
          <XCircle className="h-4 w-4 text-status-attention" />
          Cancelar plano
        </button>
        <button
          onClick={() => { onDeleteAccount(); setOpen(false); }}
          className="flex items-center gap-2.5 rounded-lg border border-red-200 bg-card px-4 py-2.5 text-sm font-medium text-red-600 shadow-lg hover:bg-red-50 transition-colors whitespace-nowrap"
        >
          <Trash2 className="h-4 w-4" />
          Excluir conta
        </button>
      </div>

      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all duration-200 active:scale-95",
          open
            ? "bg-foreground text-background"
            : "bg-primary text-primary-foreground hover:scale-105"
        )}
        title="Configurações da conta"
      >
        {open ? <X className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
      </button>
    </div>
  );
}

// ─── Dashboard principal ──────────────────────────────────────
export default function Dashboard() {
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [cancelPlanOpen, setCancelPlanOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("documents")
        .select("id, name, expiry_date, doc_type, employee_id, employee:employees(id, full_name, companies(name)), company:companies(name)")
        .order("expiry_date", { ascending: true });
      setDocs((data as any) ?? []);
    })();
  }, []);

  const counts = { expired: 0, in7: 0, in30: 0, ok: 0 };
  docs.forEach((d) => {
    const s = getStatus(d.expiry_date);
    if (s.key === "expired") counts.expired++;
    else if (s.daysLeft <= 7) counts.in7++;
    else if (s.daysLeft <= 30) counts.in30++;
    else counts.ok++;
  });

  const upcoming = docs
    .map((d) => ({ d, s: getStatus(d.expiry_date) }))
    .filter(({ s }) => s.key !== "ok")
    .slice(0, 3);

  const cards = [
    { label: "Vencidos", value: counts.expired, icon: AlertTriangle, accent: "expired" },
    { label: "Vencem em 7 dias", value: counts.in7, icon: Clock, accent: "attention" },
    { label: "Vencem em 30 dias", value: counts.in30, icon: Calendar, accent: "warning" },
    { label: "Em dia", value: counts.ok, icon: CheckCircle2, accent: "ok" },
  ] as const;

  const accentMap = {
    expired: "border-l-status-expired text-status-expired",
    attention: "border-l-status-attention text-status-attention",
    warning: "border-l-status-warning text-status-warning",
    ok: "border-l-status-ok text-status-ok",
  } as const;

  return (
    <>
      <div className="space-y-4">
        <div className="border-b border-border pb-3">
          <h1 className="text-xl font-semibold tracking-tight">Painel</h1>
          <p className="text-xs text-muted-foreground">Visao geral dos vencimentos.</p>
        </div>

        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {cards.map((c) => (
            <div
              key={c.label}
              className={cn(
                "flex items-center gap-3 rounded border border-border border-l-4 bg-card px-3 py-3 sm:px-4",
                accentMap[c.accent]
              )}
            >
              <c.icon className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
              <div className="min-w-0">
                <div className="text-[10px] font-medium uppercase leading-tight tracking-wide text-muted-foreground sm:text-[11px]">
                  {c.label}
                </div>
                <div className="text-xl font-bold tabular-nums text-foreground sm:text-2xl">
                  {c.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        {counts.expired + counts.in7 > 0 && (
          <div className="flex items-start gap-2.5 rounded border border-status-attention/30 bg-status-attention-soft px-3 py-2.5 text-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-status-attention" />
            <div>
              <span className="font-semibold text-status-attention">
                {counts.expired + counts.in7}{" "}
                {counts.expired + counts.in7 === 1 ? "documento precisa" : "documentos precisam"} de
                atencao esta semana.
              </span>
              <span className="ml-1 text-foreground/70">Resolva agora para evitar multas.</span>
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border bg-secondary/60 px-3 py-2">
            <h2 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Proximos vencimentos
            </h2>
            <Link to="/relatorios" className="text-[11px] font-medium text-primary hover:underline">
              Ver relatorio completo
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-status-ok" />
              <p className="mt-2 text-sm font-medium">Tudo em dia</p>
              <p className="text-xs text-muted-foreground">
                Nenhum documento vencendo nos proximos 30 dias.
              </p>
            </div>
          ) : (
            <>
              {/* Mobile */}
              <div className="divide-y divide-border sm:hidden">
                {upcoming.map(({ d, s }) => {
                  const link = d.employee_id ? `/funcionarios/${d.employee_id}` : `/documentos-empresa`;
                  const statusLabel = s.key === "expired" ? "VENCIDO" : s.key === "attention" ? "URGENTE" : "ATENCAO";
                  return (
                    <Link key={d.id} to={link} className="flex items-start justify-between gap-3 px-3 py-3 hover:bg-secondary/40">
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={cn("inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-[11px] font-medium", s.className)}>
                            <span className={cn("h-1.5 w-1.5 rounded-full", s.dotClass)} />
                            {statusLabel}
                          </span>
                          <span className="truncate text-sm font-medium text-foreground">
                            {d.name}
                            {d.doc_type && <span className="ml-1 text-[11px] font-normal text-muted-foreground">({d.doc_type})</span>}
                          </span>
                        </div>
                        <p className="truncate text-xs text-muted-foreground">
                          {d.employee ? `${d.employee.full_name} — ${d.employee.companies?.name ?? ""}` : d.company?.name ?? ""}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Vence em <span className="font-medium text-foreground">{format(new Date(d.expiry_date), "dd/MM/yyyy", { locale: ptBR })}</span>
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <span className={cn("whitespace-nowrap text-xs font-medium", s.key === "expired" ? "text-status-expired" : s.key === "attention" ? "text-status-attention" : "text-status-warning")}>
                          {formatDaysLeft(s.daysLeft)}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Desktop */}
              <table className="hidden w-full text-sm sm:table">
                <thead className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Status</th>
                    <th className="px-3 py-2 font-semibold">Documento</th>
                    <th className="px-3 py-2 font-semibold">Vinculo</th>
                    <th className="px-3 py-2 font-semibold">Vencimento</th>
                    <th className="px-3 py-2 font-semibold">Restante</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {upcoming.map(({ d, s }) => {
                    const link = d.employee_id ? `/funcionarios/${d.employee_id}` : `/documentos-empresa`;
                    return (
                      <tr key={d.id} className="hover:bg-secondary/40">
                        <td className="px-3 py-2">
                          <span className={cn("inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-[11px] font-medium", s.className)}>
                            <span className={cn("h-1.5 w-1.5 rounded-full", s.dotClass)} />
                            {s.key === "expired" ? "VENCIDO" : s.key === "attention" ? "URGENTE" : "ATENCAO"}
                          </span>
                        </td>
                        <td className="px-3 py-2 font-medium">
                          {d.name}
                          {d.doc_type && <span className="ml-1.5 text-[11px] font-normal text-muted-foreground">({d.doc_type})</span>}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {d.employee ? `${d.employee.full_name} — ${d.employee.companies?.name ?? ""}` : d.company?.name ?? ""}
                        </td>
                        <td className="px-3 py-2 tabular-nums">
                          {format(new Date(d.expiry_date), "dd/MM/yyyy", { locale: ptBR })}
                        </td>
                        <td className={cn("px-3 py-2 text-xs font-medium", s.key === "expired" ? "text-status-expired" : s.key === "attention" ? "text-status-attention" : "text-status-warning")}>
                          {formatDaysLeft(s.daysLeft)}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <Link to={link} className="inline-flex items-center text-muted-foreground hover:text-primary">
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>

      {/* ── Botão flutuante ── */}
      <FloatingMenu
        onFeedback={() => setFeedbackOpen(true)}
        onCancelPlan={() => setCancelPlanOpen(true)}
        onDeleteAccount={() => setDeleteAccountOpen(true)}
      />

      {/* ── Modais ── */}
      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
      <CancelPlanModal open={cancelPlanOpen} onClose={() => setCancelPlanOpen(false)} />
      <DeleteAccountModal open={deleteAccountOpen} onClose={() => setDeleteAccountOpen(false)} />
    </>
  );
}