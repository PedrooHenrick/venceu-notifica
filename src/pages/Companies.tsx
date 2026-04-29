import { useState } from "react";
import { Building2, Plus, Pencil, Trash2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";

const schema = z.object({
  name: z.string().trim().min(1, "Nome obrigatório").max(120),
  cnpj: z.string().trim().max(20).optional(),
  notes: z.string().trim().max(500).optional(),
});

interface Company { id: string; name: string; cnpj: string | null; notes: string | null }

export default function Companies() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [form, setForm] = useState({ name: "", cnpj: "", notes: "" });

  const { data: list = [] } = useQuery<Company[]>({
    queryKey: ["companies"],
    queryFn: async () => {
      const { data } = await supabase.from("companies").select("*").order("name");
      return data ?? [];
    },
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["companies"] });

  const openNew = () => { setEditing(null); setForm({ name: "", cnpj: "", notes: "" }); setOpen(true); };
  const openEdit = (c: Company) => { setEditing(c); setForm({ name: c.name, cnpj: c.cnpj ?? "", notes: c.notes ?? "" }); setOpen(true); };

  const submit = async () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    if (editing) {
      const { error } = await supabase.from("companies").update(parsed.data).eq("id", editing.id);
      if (error) return toast.error(error.message);
      toast.success("Empresa atualizada");
    } else {
      const { error } = await supabase.from("companies").insert([{ name: parsed.data.name, cnpj: parsed.data.cnpj, notes: parsed.data.notes, user_id: user!.id }]);
      if (error) return toast.error(error.message);
      toast.success("Empresa cadastrada");
    }
    setOpen(false); refresh();
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir esta empresa? Funcionários e documentos vinculados também serão removidos.")) return;
    const { error } = await supabase.from("companies").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Empresa removida"); refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Empresas</h1>
          <p className="text-xs text-muted-foreground">Cadastre matriz e filiais.</p>
        </div>
        <Button onClick={openNew} size="sm" className="h-8 gap-1.5"><Plus className="h-3.5 w-3.5" />Nova empresa</Button>
      </div>

      {list.length === 0 ? (
        <div className="rounded border border-dashed border-border bg-card p-8 text-center text-sm">
          <Building2 className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 font-medium">Nenhuma empresa cadastrada</p>
          <Button className="mt-3 h-8 gap-1.5" size="sm" onClick={openNew}><Plus className="h-3.5 w-3.5" />Nova empresa</Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/60 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-semibold">Empresa</th>
                <th className="px-3 py-2 font-semibold">CNPJ</th>
                <th className="px-3 py-2 font-semibold">Observações</th>
                <th className="px-3 py-2 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.map((c) => (
                <tr key={c.id} className="hover:bg-secondary/40">
                  <td className="px-3 py-2 font-medium">{c.name}</td>
                  <td className="px-3 py-2 text-muted-foreground">{c.cnpj || "—"}</td>
                  <td className="px-3 py-2 truncate text-muted-foreground">{c.notes || "—"}</td>
                  <td className="px-3 py-2 text-right">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => remove(c.id)}><Trash2 className="h-3.5 w-3.5 text-status-expired" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Editar empresa" : "Nova empresa"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Nome *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Razão social ou nome fantasia" /></div>
            <div><Label>CNPJ</Label><Input value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} placeholder="00.000.000/0000-00" /></div>
            <div><Label>Observações</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} /></div>
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