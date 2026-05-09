import { useCallback, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Pencil, Trash2, FileText, Upload,
  X, CheckCircle2, AlertTriangle, Loader2, FileUp,
  PlusCircle, ScanText,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { getStatus, formatDaysLeft } from "@/lib/status";
import { cn } from "@/lib/utils";

const MAX_FILES     = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

interface Employee {
  id: string; full_name: string; cpf: string | null;
  role: string | null; company_id: string;
  companies?: { name: string } | null;
}
interface Doc {
  id: string; name: string; doc_type: string | null;
  issue_date: string | null; expiry_date: string; notes: string | null;
}
interface ExtractedDoc {
  fileName: string; success: boolean; error?: string;
  data?: { tipo_documento: string | null; nome_funcionario: string | null; data_emissao: string | null; data_vencimento: string | null; };
  edited?: { tipo_documento: string; data_emissao: string; data_vencimento: string; };
  skip?: boolean;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}

async function callFunction(name: string, body?: object) {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${name}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session?.access_token}` },
      body: body ? JSON.stringify(body) : undefined,
    }
  );
  return res;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = () => reject(new Error("Erro ao ler arquivo"));
    reader.readAsDataURL(file);
  });
}

function toInputDate(date: string | null | undefined): string {
  if (!date) return "";
  const match = date.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return date;
  return `${match[3]}-${match[2]}-${match[1]}`;
}

// ── Modal Upload (PDF automático) ─────────────────────────────
function UploadModal({ open, onClose, employeeId, userId, onSaved }: {
  open: boolean; onClose: () => void; employeeId: string; userId: string; onSaved: () => void;
}) {
  const [step, setStep] = useState<"upload" | "processing" | "confirm">("upload");
  const [dragOver, setDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [results, setResults] = useState<ExtractedDoc[]>([]);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => { setStep("upload"); setSelectedFiles([]); setResults([]); setSaving(false); setDragOver(false); };
  const handleClose = () => { reset(); onClose(); };

  const addFiles = (incoming: FileList | File[]) => {
    const arr = Array.from(incoming);
    const valid: File[] = [];
    for (const f of arr) {
      if (!f.name.toLowerCase().endsWith(".pdf")) { toast.error(`"${f.name}" não é um PDF`); continue; }
      if (f.size > MAX_FILE_SIZE) { toast.error(`"${f.name}" excede 10MB`); continue; }
      valid.push(f);
    }
    setSelectedFiles((prev) => {
      const merged = [...prev, ...valid];
      if (merged.length > MAX_FILES) {
        toast.error(
          `Limite de ${MAX_FILES} arquivos atingido. Remova alguns antes de adicionar mais.`
        );
        return prev;
      }
      return merged;
    });
  };

  const removeFile = (idx: number) => setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files);
  }, []);

  const processFiles = async () => {
    if (selectedFiles.length === 0) return;
    setStep("processing");
    try {
      const files = await Promise.all(selectedFiles.map(async (f) => ({ name: f.name, size: f.size, base64: await fileToBase64(f) })));
      const res = await callFunction("process-pdf-documents", { files });
      const json = await res.json();
      if (!res.ok) { toast.error(json?.error ?? "Erro ao processar PDFs"); setStep("upload"); return; }
      const enriched: ExtractedDoc[] = (json.results as ExtractedDoc[]).map((r) => ({
        ...r, skip: false,
        edited: r.success && r.data ? {
          tipo_documento: r.data.tipo_documento ?? "",
          data_emissao: toInputDate(r.data.data_emissao),
          data_vencimento: toInputDate(r.data.data_vencimento),
        } : { tipo_documento: "", data_emissao: "", data_vencimento: "" },
      }));
      setResults(enriched); setStep("confirm");
    } catch { toast.error("Erro inesperado. Tente novamente."); setStep("upload"); }
  };

  const updateEdited = (idx: number, field: string, value: string) =>
    setResults((prev) => prev.map((r, i) => i !== idx ? r : { ...r, edited: { ...r.edited!, [field]: value } }));

  const toggleSkip = (idx: number) =>
    setResults((prev) => prev.map((r, i) => i !== idx ? r : { ...r, skip: !r.skip }));

  const saveAll = async () => {
    const toSave = results.filter((r) => r.success && !r.skip && r.edited?.tipo_documento && r.edited?.data_vencimento);
    if (toSave.length === 0) { toast.error("Nenhum documento válido para salvar"); return; }
    setSaving(true);
    try {
      const inserts = toSave.map((r) => ({
        name: r.edited!.tipo_documento, doc_type: r.edited!.tipo_documento,
        issue_date: r.edited!.data_emissao || null, expiry_date: r.edited!.data_vencimento,
        employee_id: employeeId, company_id: null, user_id: userId, notes: null,
      }));
      const { error } = await supabase.from("documents").insert(inserts);
      if (error) { toast.error(error.message); setSaving(false); return; }
      toast.success(`${inserts.length} documento(s) cadastrado(s) com sucesso!`);
      onSaved(); handleClose();
    } catch { toast.error("Erro ao salvar. Tente novamente."); setSaving(false); }
  };

  const readyCount = results.filter((r) => r.success && !r.skip && r.edited?.tipo_documento && r.edited?.data_vencimento).length;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileUp className="h-5 w-5 text-primary" />
            {step === "upload" && "Enviar documentos PDF"}
            {step === "processing" && "Analisando documentos..."}
            {step === "confirm" && "Confirmar dados extraídos"}
          </DialogTitle>
        </DialogHeader>

        {step === "upload" && (
          <div className="flex flex-col gap-4 overflow-y-auto">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-10 transition-colors",
                dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-secondary/40"
              )}
            >
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium">Arraste os PDFs aqui ou clique para selecionar</p>
                <p className="text-xs text-muted-foreground mt-1">Máximo {MAX_FILES} arquivos · 10MB cada · somente PDF</p>
              </div>
              <input ref={inputRef} type="file" accept=".pdf" multiple className="hidden"
                onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }} />
            </div>

            {selectedFiles.length > 0 && (
              <div className="space-y-1.5">
                {selectedFiles.map((f, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 rounded border border-border bg-secondary/30 px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-4 w-4 shrink-0 text-primary" />
                      <span className="truncate text-sm">{f.name}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">({(f.size / 1024).toFixed(0)} KB)</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); removeFile(i); }} className="shrink-0 text-muted-foreground hover:text-red-500 transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>Cancelar</Button>
              <Button onClick={processFiles} disabled={selectedFiles.length === 0} className="gap-2">
                <Upload className="h-4 w-4" />Analisar {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ""}
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === "processing" && (
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div className="text-center">
              <p className="text-sm font-medium">Analisando {selectedFiles.length} documento(s)...</p>
              <p className="text-xs text-muted-foreground mt-1">Extraindo os dados. Isso pode levar alguns segundos.</p>
            </div>
          </div>
        )}

        {step === "confirm" && (
          <div className="flex flex-col gap-3 overflow-y-auto min-h-0 flex-1">
            <p className="text-xs text-muted-foreground">
              Revise os dados extraídos. Você pode editar qualquer campo antes de salvar. Desmarque os documentos que não quer cadastrar.
            </p>
            <div className="space-y-3 overflow-y-auto pr-1">
              {results.map((r, idx) => (
                <div key={idx} className={cn("rounded-lg border p-3 transition-opacity",
                  r.skip ? "opacity-40 border-border" : r.success ? "border-border" : "border-red-200 bg-red-50/50")}>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      {r.success ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" /> : <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />}
                      <span className="truncate text-xs text-muted-foreground">{r.fileName}</span>
                    </div>
                    {r.success && (
                      <button onClick={() => toggleSkip(idx)} className={cn("shrink-0 text-xs font-medium transition-colors px-2 py-0.5 rounded",
                        r.skip ? "text-primary hover:text-primary/80" : "text-muted-foreground hover:text-red-500")}>
                        {r.skip ? "Incluir" : "Ignorar"}
                      </button>
                    )}
                  </div>
                  {!r.success && <p className="text-xs text-red-600">{r.error ?? "Não foi possível extrair os dados deste arquivo."}</p>}
                  {r.success && !r.skip && (
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="sm:col-span-3">
                        <Label className="text-xs">Tipo do documento *</Label>
                        <Input value={r.edited?.tipo_documento ?? ""} onChange={(e) => updateEdited(idx, "tipo_documento", e.target.value)}
                          placeholder="Ex: ASO, NR-10, CNH..." className="h-8 text-sm mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs">Data de emissão</Label>
                        <Input type="date" value={r.edited?.data_emissao ?? ""} onChange={(e) => updateEdited(idx, "data_emissao", e.target.value)} className="h-8 text-sm mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs">Data de vencimento *</Label>
                        <Input type="date" value={r.edited?.data_vencimento ?? ""} onChange={(e) => updateEdited(idx, "data_vencimento", e.target.value)}
                          className={cn("h-8 text-sm mt-1", !r.edited?.data_vencimento && "border-red-300")} />
                      </div>
                      <div>
                        <Label className="text-xs">Funcionário (extraído)</Label>
                        <Input value={r.data?.nome_funcionario ?? "—"} disabled className="h-8 text-sm mt-1 opacity-60" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <DialogFooter className="pt-2 border-t border-border mt-auto">
              <Button variant="outline" onClick={() => { setStep("upload"); setResults([]); }}>Voltar</Button>
              <Button onClick={saveAll} disabled={saving || readyCount === 0} className="gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Salvar {readyCount > 0 ? `${readyCount} documento(s)` : ""}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Modal Adicionar manualmente ───────────────────────────────
function ManualModal({ open, onClose, employeeId, userId, onSaved }: {
  open: boolean; onClose: () => void; employeeId: string; userId: string; onSaved: () => void;
}) {
  const [form, setForm] = useState({ doc_type: "", issue_date: "", expiry_date: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const handleClose = () => { setForm({ doc_type: "", issue_date: "", expiry_date: "", notes: "" }); onClose(); };

  const save = async () => {
    if (!form.doc_type.trim()) { toast.error("Tipo do documento obrigatório"); return; }
    if (!form.expiry_date) { toast.error("Data de vencimento obrigatória"); return; }
    setSaving(true);
    const { error } = await supabase.from("documents").insert([{
      name: form.doc_type.trim(), doc_type: form.doc_type.trim(),
      issue_date: form.issue_date || null, expiry_date: form.expiry_date,
      employee_id: employeeId, company_id: null, user_id: userId, notes: form.notes || null,
    }]);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Documento cadastrado");
    onSaved(); handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-primary" />
            Adicionar data manualmente
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Tipo do documento *</Label>
            <Input value={form.doc_type} onChange={(e) => setForm({ ...form, doc_type: e.target.value })}
              placeholder="Ex: ASO, NR-10, CNH..." className="mt-1" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Data de emissão</Label>
              <Input type="date" value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Data de vencimento *</Label>
              <Input type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} className="mt-1" />
            </div>
          </div>
          <div>
            <Label>Observações</Label>
            <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Opcional..." className="mt-1" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancelar</Button>
          <Button onClick={save} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ══════════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ══════════════════════════════════════════════════════════════
export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Doc | null>(null);
  const [editForm, setEditForm] = useState({ doc_type: "", issue_date: "", expiry_date: "", notes: "" });
  const [editOpen, setEditOpen] = useState(false);

  const { data: employee, isLoading } = useQuery<Employee | null>({
    queryKey: ["employee", id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await supabase.from("employees").select("*, companies(name)").eq("id", id).maybeSingle();
      return (data as any) ?? null;
    },
    enabled: !!id,
  });

  const { data: docs = [] } = useQuery<Doc[]>({
    queryKey: ["employee-docs", id],
    queryFn: async () => {
      const { data } = await supabase.from("documents").select("*").eq("employee_id", id).order("expiry_date");
      return (data as any) ?? [];
    },
    enabled: !!id,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["employee", id] });
    queryClient.invalidateQueries({ queryKey: ["employee-docs", id] });
    queryClient.invalidateQueries({ queryKey: ["employees"] });
  };

  const openEdit = (d: Doc) => {
    setEditingDoc(d);
    setEditForm({ doc_type: d.doc_type ?? "", issue_date: d.issue_date ?? "", expiry_date: d.expiry_date, notes: d.notes ?? "" });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editingDoc) return;
    if (!editForm.doc_type.trim()) { toast.error("Tipo obrigatório"); return; }
    if (!editForm.expiry_date) { toast.error("Data de vencimento obrigatória"); return; }
    const { error } = await supabase.from("documents").update({
      name: editForm.doc_type.trim(), doc_type: editForm.doc_type.trim(),
      issue_date: editForm.issue_date || null, expiry_date: editForm.expiry_date, notes: editForm.notes || null,
    }).eq("id", editingDoc.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Documento atualizado");
    setEditOpen(false); refresh();
  };

  const remove = async (docId: string) => {
    if (!confirm("Excluir este documento?")) return;
    const { error } = await supabase.from("documents").delete().eq("id", docId);
    if (error) { toast.error(error.message); return; }
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

  if (isLoading) return null;
  if (!employee) return (
    <div className="p-8 text-center text-sm">
      <p className="font-medium">Funcionário não encontrado.</p>
      <Button variant="link" onClick={() => navigate("/funcionarios")}>Voltar para a lista</Button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div>
        <Link to="/funcionarios" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-3 w-3" /> Funcionários
        </Link>
      </div>

      {/* Card do funcionário */}
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

      {/* Header da seção de documentos */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/80">Documentos do funcionário</h2>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setManualOpen(true)}
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 text-xs"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Adicionar data
          </Button>
          <Button
            onClick={() => setUploadOpen(true)}
            size="sm"
            className="h-8 gap-1.5 text-xs"
          >
            <ScanText className="h-3.5 w-3.5" />
            Enviar PDF
          </Button>
        </div>
      </div>

      {/* Banner explicativo dos dois botões */}
      <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
        <p className="text-[12px] font-semibold text-blue-700 mb-2">Como adicionar documentos?</p>
        <div className="flex flex-col gap-1.5 sm:flex-row sm:gap-6">
          <div className="flex items-start gap-2">
            <PlusCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-blue-500" />
            <p className="text-[12px] text-blue-700">
              <span className="font-semibold">Adicionar data</span> — preencha o tipo e as datas do documento manualmente.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <ScanText className="h-3.5 w-3.5 mt-0.5 shrink-0 text-blue-500" />
            <p className="text-[12px] text-blue-700">
              <span className="font-semibold">Enviar PDF</span> — envie o arquivo e o sistema extrai as datas automaticamente.
            </p>
          </div>
        </div>
      </div>

      {/* Lista de documentos */}
      {docs.length === 0 ? (
        <div
          onClick={() => setUploadOpen(true)}
          className="cursor-pointer rounded border-2 border-dashed border-border bg-card p-10 text-center hover:border-primary/50 hover:bg-secondary/30 transition-colors"
        >
          <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm font-medium">Nenhum documento cadastrado</p>
          <p className="text-xs text-muted-foreground mt-1">Clique aqui ou arraste PDFs para começar</p>
        </div>
      ) : (
        <>
          {/* Mobile */}
          <div className="divide-y divide-border overflow-hidden rounded border border-border bg-card sm:hidden">
            {docs.map((d) => {
              const s = getStatus(d.expiry_date);
              const statusLabel = s.key === "expired" ? "VENCIDO" : s.key === "attention" ? "URGENTE" : s.key === "warning" ? "ATENÇÃO" : "EM DIA";
              return (
                <div key={d.id} className="flex items-start justify-between gap-3 px-3 py-3">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cn("inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-[11px] font-medium", s.className)}>
                        <span className={cn("h-1.5 w-1.5 rounded-full", s.dotClass)} />{statusLabel}
                      </span>
                      <span className="text-sm font-medium text-foreground">{d.doc_type || "—"}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                      <span>Emissão: {d.issue_date ? format(new Date(d.issue_date), "dd/MM/yyyy", { locale: ptBR }) : "—"}</span>
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

          {/* Desktop */}
          <div className="hidden overflow-hidden rounded border border-border bg-card sm:block">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/60 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-semibold">Status</th>
                  <th className="px-3 py-2 font-semibold">Tipo</th>
                  <th className="px-3 py-2 font-semibold">Emissão</th>
                  <th className="px-3 py-2 font-semibold">Vencimento</th>
                  <th className="px-3 py-2 font-semibold">Restante</th>
                  <th className="px-3 py-2 text-right font-semibold">Ações</th>
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
                          {s.key === "expired" ? "VENCIDO" : s.key === "attention" ? "URGENTE" : s.key === "warning" ? "ATENÇÃO" : "EM DIA"}
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

      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} employeeId={id!} userId={user!.id} onSaved={refresh} />
      <ManualModal open={manualOpen} onClose={() => setManualOpen(false)} employeeId={id!} userId={user!.id} onSaved={refresh} />

      {/* Modal de edição */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Editar documento</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tipo *</Label>
              <Input value={editForm.doc_type} onChange={(e) => setEditForm({ ...editForm, doc_type: e.target.value })}
                placeholder="Ex: ASO, NR-10, CNH..." className="mt-1" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Data de emissão</Label><Input type="date" value={editForm.issue_date} onChange={(e) => setEditForm({ ...editForm, issue_date: e.target.value })} /></div>
              <div><Label>Data de vencimento *</Label><Input type="date" value={editForm.expiry_date} onChange={(e) => setEditForm({ ...editForm, expiry_date: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button onClick={saveEdit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}