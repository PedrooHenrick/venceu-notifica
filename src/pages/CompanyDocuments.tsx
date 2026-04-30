import { useMemo, useState } from "react";
import { FileText, Plus, Pencil, Trash2, Search, ChevronRight } from "lucide-react";
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

const COMPANY_TYPES = ["AVCB", "Alvara Sanitario", "Alvara de Funcionamento", "Licenca Ambiental", "PPRA / PGR", "PCMSO", "LTCAT", "Laudo Eletrico", "SPDA", "Contrato", "Outro"];

const schema = z.object({
  doc_type: z.string().trim().min(1, "Selecione o tipo do documento"),
  company_id: z.string().uuid("Selecione a empresa"),
  issue_date: z.string().optional(),
  expiry_date: z.string().min(1, "Data de vencimento obrigatoria"),
  notes: z.string().trim().max(500).optional(),
});

interface Doc { id: string; name: string; doc_type: string | null; issue_date: string | null; expiry_date: string; notes: string | null; company_id: string | null; company?: { name: string } | null }
interface Company { id: string; name: string }

export default function CompanyDocuments() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Doc | null>(null);
  const [form, setForm] = useState({ doc_type: "", company_id: "", issue_date: "", expiry_date: "", notes: "" });
  const [filter, setFilter] = useState("");

  const { data: list = [] } = useQuery<Doc[]>({
    queryKey: ["company-documents"],
    queryFn: async () => {
      const { data } = await supabase
        .from("documents")
        .select("*, company:companies(name)")
        .not("company_id", "is", null)
        .is("employee_id", null)
        .order("expiry_date");
      return (data as any) ?? [];
    },
  });

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["companies"],
    queryFn: async () => {
      const { data } = await supabase.from("companies").select("id, name").order("name");
      return data ?? [];
    },
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["company-documents"] });
    queryClient.invalidateQueries({ queryKey: ["companies"] });
  };

  const openNew = () => { setEditing(null); setForm({ doc_type: "", company_id: companies[0]?.id ?? "", issue_date: "", expiry_date: "", notes: "" }); setOpen(true); };
  const openEdit = (d: Doc) => { setEditing(d); setForm({ doc_type: d.doc_type ?? "", company_id: d.company_id ?? "", issue_date: d.issue_date ?? "", expiry_date: d.expiry_date, notes: d.notes ?? "" }); setOpen(true); };

  const submit = async () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    const payload = {
      name: parsed.data.doc_type,
      doc_type: parsed.data.doc_type,
      company_id: parsed.data.company_id,
      employee_id: null,
      issue_date: parsed.data.issue_date || null,
      expiry_date: parsed.data.expiry_date,
      notes: parsed.data.notes || null,
    };
    if (editing) {
      const { error } = await supabase.from("documents").update(payload).eq("id", editing.id);
      if (error) return toast.error(error.message);
      toast.success("Documento atualizado");
    } else {
      const { error } = await supabase.from("documents").insert([{ ...payload, user_id: user!.id }]);
      if (error) return toast.error(error.message);
      toast.success("Documento cadastrado");
    }
    setOpen(false); refresh();
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir este documento?")) return;
    const { error } = await supabase.from("documents").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Removido"); refresh();
  };

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return list;
    return list.filter((d) =>
      (d.doc_type ?? "").toLowerCase().includes(q) ||
      (d.company?.name ?? "").toLowerCase().includes(q)
    );
  }, [list, filter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Documentos da Empresa</h1>
          <p className="text-xs text-muted-foreground">AVCB, alvaras, laudos e licencas por empresa.</p>
        </div>
        <Button onClick={openNew} disabled={companies.length === 0} size="sm" className="h-8 gap-1.5">
          <Plus className="h-3.5 w-3.5" />Novo documento
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Buscar..." className="h-8 pl-8 text-sm" />
      </div>

      {companies.length === 0 ? (
        <div className="rounded border border-dashed border-border bg-card p-8 text-center text-sm">
          <p className="font-medium">Cadastre uma empresa primeiro</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded border border-dashed border-border bg-card p-8 text-center text-sm">
          <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Nenhum documento da empresa cadastrado.</p>
        </div>
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="divide-y divide-border overflow-hidden rounded border border-border bg-card sm:hidden">
            {filtered.map((d) => {
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
                    <p className="text-xs text-muted-foreground">{d.company?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Vence em{" "}
                      <span className="font-medium text-foreground">
                        {format(new Date(d.expiry_date), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                      <span className={cn("ml-2 font-medium", s.key === "expired" ? "text-status-expired" : s.key === "attention" ? "text-status-attention" : s.key === "warning" ? "text-status-warning" : "text-muted-foreground")}>
                        {formatDaysLeft(s.daysLeft)}
                      </span>
                    </p>
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
                  <th className="px-3 py-2 font-semibold">Empresa</th>
                  <th className="px-3 py-2 font-semibold">Tipo</th>
                  <th className="px-3 py-2 font-semibold">Vencimento</th>
                  <th className="px-3 py-2 font-semibold">Restante</th>
                  <th className="px-3 py-2 text-right font-semibold">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((d) => {
                  const s = getStatus(d.expiry_date);
                  return (
                    <tr key={d.id} className="hover:bg-secondary/40">
                      <td className="px-3 py-2">
                        <span className={cn("inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-[11px] font-medium", s.className)}>
                          <span className={cn("h-1.5 w-1.5 rounded-full", s.dotClass)} />
                          {s.key === "expired" ? "VENCIDO" : s.key === "attention" ? "URGENTE" : s.key === "warning" ? "ATENCAO" : "EM DIA"}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-medium">{d.company?.name}</td>
                      <td className="px-3 py-2 text-muted-foreground">{d.doc_type || "—"}</td>
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Editar documento" : "Novo documento da empresa"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Empresa *</Label>
              <Select value={form.company_id} onValueChange={(v) => setForm({ ...form, company_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{companies.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tipo *</Label>
              <Select value={form.doc_type} onValueChange={(v) => setForm({ ...form, doc_type: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                <SelectContent>{COMPANY_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
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