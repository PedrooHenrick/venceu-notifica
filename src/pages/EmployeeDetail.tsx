import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, Trash2, FileText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { getStatus, formatDaysLeft } from "@/lib/status";
import { cn } from "@/lib/utils";

const COMMON_TYPES = ["ASO", "NR-10", "NR-12", "NR-33", "NR-35", "NR-06 (EPI)", "Treinamento", "Exame Periodico", "Admissional", "Demissional"];

const schema = z.object({
  doc_type: z.string().trim().min(1, "Selecione o tipo do documento"),
  issue_date: z.string().optional(),
  expiry_date: z.string().min(1, "Data de vencimento obrigatoria"),
  notes: z.string().trim().max(500).optional(),
});

interface Employee { id: string; full_name: string; cpf: string | null; role: string | null; company_id: string; companies?: { name: string } | null }
interface Doc { id: string; name: string; doc_type: string | null; issue_date: string | null; expiry_date: string; notes: string | null }

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Doc | null>(null);
  const [form, setForm] = useState({ doc_type: "", issue_date: "", expiry_date: "", notes: "" });
  const [customTypeInput, setCustomTypeInput] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const { data: employee, isLoading: loadingEmployee } = useQuery<Employee | null>({
    queryKey: ["employee", id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await supabase
        .from("employees")
        .select("*, companies(name)")
        .eq("id", id)
        .maybeSingle();
      return (data as any) ?? null;
    },
    enabled: !!id,
  });

  const { data: docs = [] } = useQuery<Doc[]>({
    queryKey: ["employee-docs", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("documents")
        .select("*")
        .eq("employee_id", id)
        .order("expiry_date");
      return (data as any) ?? [];
    },
    enabled: !!id,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["employee", id] });
    queryClient.invalidateQueries({ queryKey: ["employee-docs", id] });
    queryClient.invalidateQueries({ queryKey: ["employees"] });
  };

  const openNew = () => {
    setEditing(null);
    setForm({ doc_type: "", issue_date: "", expiry_date: "", notes: "" });
    setCustomTypeInput("");
    setShowCustomInput(false);
    setOpen(true);
  };

  const openEdit = (d: Doc) => {
    setEditing(d);
    const isCustom = d.doc_type ? !COMMON_TYPES.includes(d.doc_type) : false;
    setShowCustomInput(isCustom);
    setCustomTypeInput(isCustom ? (d.doc_type ?? "") : "");
    setForm({ doc_type: d.doc_type ?? "", issue_date: d.issue_date ?? "", expiry_date: d.expiry_date, notes: d.notes ?? "" });
    setOpen(true);
  };

  const handleConfirmCustomType = () => {
    const trimmed = customTypeInput.trim();
    if (!trimmed) return;
    setForm((prev) => ({ ...prev, doc_type: trimmed }));
    setShowCustomInput(false);
  };

  const submit = async () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    const payload = {
      name: parsed.data.doc_type,
      doc_type: parsed.data.doc_type,
      issue_date: parsed.data.issue_date || null,
      expiry_date: parsed.data.expiry_date,
      notes: parsed.data.notes || null,
    };
    if (editing) {
      const { error } = await supabase.from("documents").update(payload).eq("id", editing.id);
      if (error) return toast.error(error.message);
      toast.success("Documento atualizado");
    } else {
      const { error } = await supabase.from("documents").insert([{ ...payload, employee_id: id, company_id: null, user_id: user!.id }]);
      if (error) return toast.error(error.message);
      toast.success("Documento cadastrado");
    }
    setOpen(false); refresh();
  };

  const remove = async (docId: string) => {
    if (!confirm("Excluir este documento?")) return;
    const { error } = await supabase.from("documents").delete().eq("id", docId);
    if (error) return toast.error(error.message);
    toast.success("Removido"); refresh();
  };

  const summary = useMemo(() => {
    const a = { expired: 0, soon: 0, ok: 0 };
    docs.forEach((d) => {
      const s = getStatus(d.expiry_date);
      if (s.key === "expired") a.expired++;
      else if (s.key === "attention" || s.key === "warning") a.soon++;
      else a.ok++;
    });
    return a;
  }, [docs]);

  if (loadingEmployee) return null;

  if (!employee) return (
    <div className="p-8 text-center text-sm">
      <p className="font-medium">Funcionario nao encontrado.</p>
      <Button variant="link" onClick={() => navigate("/funcionarios")}>Voltar para a lista</Button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div>
        <Link to="/funcionarios" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-3 w-3" /> Funcionarios
        </Link>
      </div>

      {/* Card do funcionario */}
      <div className="rounded border border-border bg-card px-4 py-3 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {initials(employee.full_name)}
            </span>
            <div>
              <div className="text-base font-semibold leading-tight">{employee.full_name}</div>
              <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[12px] text-muted-foreground">
                <span><span className="font-medium text-foreground/80">CPF:</span> {employee.cpf || "—"}</span>
                <span><span className="font-medium text-foreground/80">Cargo:</span> {employee.role || "—"}</span>
                <span><span className="font-medium text-foreground/80">Empresa:</span> {employee.companies?.name || "—"}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium">
          <span className="inline-flex items-center gap-1.5 rounded-sm bg-status-expired-soft px-2 py-1 text-status-expired">
            <span className="h-2 w-2 rounded-full bg-status-expired" />{summary.expired} vencidos
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-sm bg-status-warning-soft px-2 py-1 text-status-warning">
            <span className="h-2 w-2 rounded-full bg-status-warning" />{summary.soon} a vencer
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-sm bg-status-ok-soft px-2 py-1 text-status-ok">
            <span className="h-2 w-2 rounded-full bg-status-ok" />{summary.ok} em dia
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-border pb-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/80">Documentos do funcionario</h2>
        <Button onClick={openNew} size="sm" className="h-8 gap-1.5"><Plus className="h-3.5 w-3.5" />Novo documento</Button>
      </div>

      {docs.length === 0 ? (
        <div className="rounded border border-dashed border-border bg-card p-8 text-center text-sm">
          <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 font-medium">Nenhum documento cadastrado</p>
          <p className="text-xs text-muted-foreground">Comece adicionando o ASO, treinamentos, NRs etc.</p>
        </div>
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="divide-y divide-border overflow-hidden rounded border border-border bg-card sm:hidden">
            {docs.map((d) => {
              const s = getStatus(d.expiry_date);
              const statusLabel = s.key === "expired" ? "VENCIDO" : s.key === "attention" ? "URGENTE" : s.key === "warning" ? "ATENCAO" : "EM DIA";
              return (
                <div key={d.id} className="flex items-start justify-between gap-3 px-3 py-3">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cn("inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-[11px] font-medium", s.className)}>
                        <span className={cn("h-1.5 w-1.5 rounded-full", s.dotClass)} />
                        {statusLabel}
                      </span>
                      <span className="text-sm font-medium text-foreground">{d.doc_type || "—"}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                      <span>Emissao: {d.issue_date ? format(new Date(d.issue_date), "dd/MM/yyyy", { locale: ptBR }) : "—"}</span>
                      <span>Vence: <span className="font-medium text-foreground">{format(new Date(d.expiry_date), "dd/MM/yyyy", { locale: ptBR })}</span></span>
                    </div>
                    <span className={cn("text-xs font-medium", s.key === "expired" ? "text-status-expired" : s.key === "attention" ? "text-status-attention" : s.key === "warning" ? "text-status-warning" : "text-muted-foreground")}>
                      {formatDaysLeft(s.daysLeft)}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(d)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => remove(d.id)}><Trash2 className="h-3.5 w-3.5 text-status-expired" /></Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop: tabela */}
          <div className="hidden overflow-hidden rounded border border-border bg-card sm:block">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/60 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-semibold">Status</th>
                  <th className="px-3 py-2 font-semibold">Tipo</th>
                  <th className="px-3 py-2 font-semibold">Emissao</th>
                  <th className="px-3 py-2 font-semibold">Vencimento</th>
                  <th className="px-3 py-2 font-semibold">Restante</th>
                  <th className="px-3 py-2 text-right font-semibold">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {docs.map((d) => {
                  const s = getStatus(d.expiry_date);
                  return (
                    <tr key={d.id} className="hover:bg-secondary/40">
                      <td className="px-3 py-2">
                        <span className={cn("inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-[11px] font-medium", s.className)}>
                          <span className={cn("h-1.5 w-1.5 rounded-full", s.dotClass)} />
                          {s.key === "expired" ? "VENCIDO" : s.key === "attention" ? "URGENTE" : s.key === "warning" ? "ATENCAO" : "EM DIA"}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-medium">{d.doc_type || "—"}</td>
                      <td className="px-3 py-2 text-muted-foreground">{d.issue_date ? format(new Date(d.issue_date), "dd/MM/yyyy", { locale: ptBR }) : "—"}</td>
                      <td className="px-3 py-2">{format(new Date(d.expiry_date), "dd/MM/yyyy", { locale: ptBR })}</td>
                      <td className={cn("px-3 py-2 text-xs font-medium", s.key === "expired" ? "text-status-expired" : s.key === "attention" ? "text-status-attention" : s.key === "warning" ? "text-status-warning" : "text-muted-foreground")}>
                        {formatDaysLeft(s.daysLeft)}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(d)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => remove(d.id)}><Trash2 className="h-3.5 w-3.5 text-status-expired" /></Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setShowCustomInput(false); setCustomTypeInput(""); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Editar documento" : "Novo documento"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tipo *</Label>

              {/* Input de tipo customizado */}
              {showCustomInput ? (
                <div className="flex gap-2 mt-1.5">
                  <Input
                    placeholder="Digite o tipo do documento..."
                    value={customTypeInput}
                    onChange={(e) => setCustomTypeInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleConfirmCustomType(); }}
                    autoFocus
                  />
                  <Button size="sm" onClick={handleConfirmCustomType} disabled={!customTypeInput.trim()}>
                    Ok
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setShowCustomInput(false); setCustomTypeInput(""); setForm((prev) => ({ ...prev, doc_type: "" })); }}>
                    Voltar
                  </Button>
                </div>
              ) : (
                <>
                  <Select
                    value={COMMON_TYPES.includes(form.doc_type) ? form.doc_type : ""}
                    onValueChange={(v) => setForm({ ...form, doc_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={form.doc_type && !COMMON_TYPES.includes(form.doc_type) ? form.doc_type : "Selecione o tipo"} />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                      {/* Botão de tipo personalizado no fim do dropdown */}
                      <div className="px-2 pt-1 pb-1 border-t border-border mt-1">
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-primary hover:bg-secondary transition-colors"
                          onClick={() => { setShowCustomInput(true); setForm((prev) => ({ ...prev, doc_type: "" })); }}
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Adicionar tipo personalizado
                        </button>
                      </div>
                    </SelectContent>
                  </Select>

                  {/* Badge mostrando tipo customizado já confirmado */}
                  {form.doc_type && !COMMON_TYPES.includes(form.doc_type) && (
                    <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="rounded-sm bg-secondary px-2 py-0.5 font-medium text-foreground">{form.doc_type}</span>
                      <button
                        type="button"
                        className="hover:text-foreground transition-colors"
                        onClick={() => { setShowCustomInput(true); setCustomTypeInput(form.doc_type); }}
                      >
                        editar
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Data de emissao</Label><Input type="date" value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })} /></div>
              <div><Label>Data de vencimento *</Label><Input type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} /></div>
            </div>
            <div><Label>Observacoes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={submit}>{editing ? "Salvar" : "Cadastrar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}