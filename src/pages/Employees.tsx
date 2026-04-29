import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, Search, ChevronRight } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { getStatus } from "@/lib/status";
import { cn } from "@/lib/utils";

const schema = z.object({
  full_name: z.string().trim().min(1, "Nome obrigatório").max(120),
  cpf: z.string().trim().max(20).optional(),
  role: z.string().trim().max(80).optional(),
  company_id: z.string().uuid("Selecione a empresa"),
});

interface DocLite { expiry_date: string }
interface Employee {
  id: string;
  full_name: string;
  cpf: string | null;
  role: string | null;
  company_id: string;
  companies?: { name: string } | null;
  documents?: DocLite[];
}
interface Company { id: string; name: string }

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}

function avatarColor(name: string) {
  const palette = ["bg-primary", "bg-status-ok", "bg-status-warning", "bg-status-attention", "bg-[hsl(280_55%_45%)]", "bg-[hsl(190_70%_38%)]"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % palette.length;
  return palette[h];
}

export default function Employees() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState({ full_name: "", cpf: "", role: "", company_id: "" });
  const [filter, setFilter] = useState("");
  const [companyFilter, setCompanyFilter] = useState<string>("all");

  // ✅ React Query cacheia os dados — sem piscada ao voltar para a página
  const { data: list = [] } = useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data } = await supabase
        .from("employees")
        .select("*, companies(name), documents(expiry_date)")
        .order("full_name");
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

  // Invalida o cache após criar/editar/deletar para forçar atualização
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["employees"] });
    queryClient.invalidateQueries({ queryKey: ["companies"] });
  };

  const openNew = () => {
    setEditing(null);
    setForm({ full_name: "", cpf: "", role: "", company_id: companies[0]?.id ?? "" });
    setOpen(true);
  };

  const openEdit = (e: Employee) => {
    setEditing(e);
    setForm({ full_name: e.full_name, cpf: e.cpf ?? "", role: e.role ?? "", company_id: e.company_id });
    setOpen(true);
  };

  const submit = async () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    if (editing) {
      const { error } = await supabase.from("employees").update(parsed.data).eq("id", editing.id);
      if (error) return toast.error(error.message);
      toast.success("Funcionário atualizado");
    } else {
      const { error } = await supabase.from("employees").insert([{
        full_name: parsed.data.full_name,
        cpf: parsed.data.cpf,
        role: parsed.data.role,
        company_id: parsed.data.company_id,
        user_id: user!.id,
      }]);
      if (error) return toast.error(error.message);
      toast.success("Funcionário cadastrado");
    }
    setOpen(false);
    refresh();
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir este funcionário? Documentos vinculados também serão removidos.")) return;
    const { error } = await supabase.from("employees").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Removido");
    refresh();
  };

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return list.filter((e) => {
      if (companyFilter !== "all" && e.company_id !== companyFilter) return false;
      if (!q) return true;
      return (
        e.full_name.toLowerCase().includes(q) ||
        (e.cpf ?? "").toLowerCase().includes(q) ||
        (e.role ?? "").toLowerCase().includes(q) ||
        (e.companies?.name ?? "").toLowerCase().includes(q)
      );
    });
  }, [list, filter, companyFilter]);

  const aggregate = (docs?: DocLite[]) => {
    const a = { expired: 0, soon: 0, ok: 0, total: docs?.length ?? 0 };
    docs?.forEach((d) => {
      const s = getStatus(d.expiry_date);
      if (s.key === "expired") a.expired++;
      else if (s.key === "attention" || s.key === "warning") a.soon++;
      else a.ok++;
    });
    return a;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Funcionários</h1>
          <p className="text-xs text-muted-foreground">Clique em um funcionário para gerenciar seus documentos.</p>
        </div>
        <Button onClick={openNew} disabled={companies.length === 0} size="sm" className="h-8 gap-1.5">
          <Plus className="h-3.5 w-3.5" />Novo funcionário
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Buscar por nome, CPF, cargo..."
            className="h-8 pl-8 text-sm"
          />
        </div>
        <Select value={companyFilter} onValueChange={setCompanyFilter}>
          <SelectTrigger className="h-8 w-[200px] text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as empresas</SelectItem>
            {companies.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {companies.length === 0 ? (
        <div className="rounded border border-dashed border-border bg-card p-8 text-center text-sm">
          <p className="font-medium">Cadastre uma empresa primeiro</p>
          <p className="text-xs text-muted-foreground">Funcionários precisam estar vinculados a uma empresa.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Nenhum funcionário encontrado.
        </div>
      ) : (
        <div className="overflow-hidden rounded border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/60 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-semibold">Funcionário</th>
                <th className="px-3 py-2 font-semibold">CPF</th>
                <th className="px-3 py-2 font-semibold">Cargo</th>
                <th className="px-3 py-2 font-semibold">Empresa</th>
                <th className="px-3 py-2 text-center font-semibold">Documentos</th>
                <th className="px-3 py-2 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((e) => {
                const a = aggregate(e.documents);
                return (
                  <tr key={e.id} className="hover:bg-secondary/40">
                    <td className="px-3 py-2">
                      <Link to={`/funcionarios/${e.id}`} className="flex items-center gap-2.5 font-medium text-foreground hover:text-primary">
                        <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white", avatarColor(e.full_name))}>
                          {initials(e.full_name)}
                        </span>
                        <span className="truncate">{e.full_name}</span>
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{e.cpf || "—"}</td>
                    <td className="px-3 py-2 text-muted-foreground">{e.role || "—"}</td>
                    <td className="px-3 py-2 text-muted-foreground">{e.companies?.name}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium">
                        {a.total === 0 ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          <>
                            {a.expired > 0 && <span className="inline-flex items-center gap-1 rounded-sm bg-status-expired-soft px-1.5 py-0.5 text-status-expired"><span className="h-1.5 w-1.5 rounded-full bg-status-expired" />{a.expired}</span>}
                            {a.soon > 0 && <span className="inline-flex items-center gap-1 rounded-sm bg-status-warning-soft px-1.5 py-0.5 text-status-warning"><span className="h-1.5 w-1.5 rounded-full bg-status-warning" />{a.soon}</span>}
                            {a.ok > 0 && <span className="inline-flex items-center gap-1 rounded-sm bg-status-ok-soft px-1.5 py-0.5 text-status-ok"><span className="h-1.5 w-1.5 rounded-full bg-status-ok" />{a.ok}</span>}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-0.5">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(e)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => remove(e.id)}><Trash2 className="h-3.5 w-3.5 text-status-expired" /></Button>
                        <Button asChild size="icon" variant="ghost" className="h-7 w-7"><Link to={`/funcionarios/${e.id}`}><ChevronRight className="h-4 w-4" /></Link></Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Editar funcionário" : "Novo funcionário"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Nome completo *</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>CPF</Label><Input value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} /></div>
              <div><Label>Cargo / função</Label><Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} /></div>
            </div>
            <div>
              <Label>Empresa *</Label>
              <Select value={form.company_id} onValueChange={(v) => setForm({ ...form, company_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{companies.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
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