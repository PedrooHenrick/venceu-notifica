import { useState, useMemo } from "react";
import { Building2, Plus, Pencil, Trash2, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
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
import { useSubscription } from "@/hooks/useSubscription";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const TRIAL_MAX_COMPANIES = 2;

const schema = z.object({
  name: z.string().trim().min(1, "Nome obrigatório").max(120),
  cnpj: z.string().trim().max(20).optional(),
  notes: z.string().trim().max(500).optional(),
  active: z.boolean().optional(),
});

interface Company {
  id: string;
  name: string;
  cnpj: string | null;
  notes: string | null;
  type?: string | null;
  active?: boolean | null;
}

const PAGE_SIZE = 5;

const avatarColors = [
  "bg-blue-600", "bg-indigo-500", "bg-violet-500",
  "bg-orange-500", "bg-emerald-500", "bg-rose-500", "bg-cyan-500",
];

function CompanyAvatar({ name }: { name: string }) {
  const initials = name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const color = avatarColors[name.charCodeAt(0) % avatarColors.length];
  return (
    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[13px] font-bold text-white", color)}>
      {initials}
    </div>
  );
}

function CityIllustration() {
  return (
    <svg viewBox="0 0 900 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="900" height="220" fill="#eef3fb" />
      <ellipse cx="700" cy="38" rx="48" ry="16" fill="white" opacity="0.8"/>
      <ellipse cx="730" cy="32" rx="34" ry="13" fill="white" opacity="0.9"/>
      <ellipse cx="670" cy="34" rx="28" ry="11" fill="white" opacity="0.7"/>
      <ellipse cx="820" cy="55" rx="36" ry="12" fill="white" opacity="0.7"/>
      <ellipse cx="845" cy="50" rx="24" ry="10" fill="white" opacity="0.8"/>
      <rect x="480" y="60" width="55" height="160" rx="3" fill="#c8d9f0"/>
      <rect x="620" y="40" width="70" height="180" rx="3" fill="#c0d2ea"/>
      <rect x="740" y="25" width="50" height="195" rx="3" fill="#b8cce4"/>
      <rect x="800" y="70" width="100" height="150" rx="3" fill="#ccdaf0"/>
      <rect x="530" y="80" width="60" height="140" rx="3" fill="#9ab8d8"/>
      <rect x="660" y="55" width="65" height="165" rx="3" fill="#8fb0d0"/>
      <rect x="597" y="168" width="6" height="30" rx="2" fill="#8fae7a"/>
      <ellipse cx="600" cy="158" rx="22" ry="20" fill="#7ec87a"/>
      <rect x="643" y="172" width="6" height="26" rx="2" fill="#8fae7a"/>
      <ellipse cx="646" cy="163" rx="20" ry="18" fill="#7ec87a"/>
      <rect x="793" y="165" width="6" height="33" rx="2" fill="#8fae7a"/>
      <ellipse cx="796" cy="154" rx="23" ry="21" fill="#7ec87a"/>
      <rect x="0" y="198" width="900" height="22" rx="0" fill="#d4e4f7"/>
    </svg>
  );
}

function StatusBadge({ active }: { active?: boolean | null }) {
  const isActive = active !== false;
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium",
      isActive ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-600"
    )}>
      <span className={cn("h-1.5 w-1.5 rounded-full", isActive ? "bg-green-500" : "bg-orange-400")} />
      {isActive ? "Ativa" : "Inativa"}
    </span>
  );
}

function CompanyCard({ c, onEdit, onRemove }: { c: Company; onEdit: (c: Company) => void; onRemove: (id: string) => void }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3">
      <CompanyAvatar name={c.name} />
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-gray-900 text-sm truncate">{c.name}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-[11px] text-gray-400">{(c as any).type ?? "Matriz"}</span>
          {c.cnpj && <span className="text-[11px] text-gray-400">· {c.cnpj}</span>}
        </div>
        {c.notes && <p className="text-[11px] text-gray-400 truncate mt-0.5">{c.notes}</p>}
        <div className="mt-1.5"><StatusBadge active={(c as any).active} /></div>
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        <button onClick={() => onEdit(c)} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button onClick={() => onRemove(c.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function Companies() {
  const { user } = useAuth();
  const { isTrial } = useSubscription();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [form, setForm] = useState({ name: "", cnpj: "", notes: "", type: "Matriz", active: true });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data: list = [] } = useQuery<Company[]>({
    queryKey: ["companies"],
    queryFn: async () => {
      const { data } = await supabase.from("companies").select("*").order("name");
      return data ?? [];
    },
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return list.filter((c) => c.name.toLowerCase().includes(q) || (c.cnpj ?? "").includes(q));
  }, [list, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["companies"] });

  const openNew = () => {
    // Verifica limite do trial
    if (isTrial && list.length >= TRIAL_MAX_COMPANIES) {
      toast.error(`Limite de ${TRIAL_MAX_COMPANIES} empresas atingido no período de teste.`, {
        description: "Assine o plano Pro para cadastrar empresas ilimitadas.",
        action: { label: "Ver planos", onClick: () => navigate("/planos") },
      });
      return;
    }
    setEditing(null);
    setForm({ name: "", cnpj: "", notes: "", type: "Matriz", active: true });
    setOpen(true);
  };

  const openEdit = (c: Company) => {
    setEditing(c);
    setForm({ name: c.name, cnpj: c.cnpj ?? "", notes: c.notes ?? "", type: (c as any).type ?? "Matriz", active: (c as any).active !== false });
    setOpen(true);
  };

  const submit = async () => {
    const parsed = schema.safeParse({ ...form });
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }

    if (editing) {
      const { error } = await supabase.from("companies").update({ name: form.name, cnpj: form.cnpj, notes: form.notes }).eq("id", editing.id);
      if (error) return toast.error(error.message);
      toast.success("Empresa atualizada");
    } else {
      // Verifica limite novamente no submit (segurança extra)
      if (isTrial && list.length >= TRIAL_MAX_COMPANIES) {
        toast.error(`Limite de ${TRIAL_MAX_COMPANIES} empresas atingido no período de teste.`);
        setOpen(false);
        return;
      }
      const { error } = await supabase.from("companies").insert([{ name: form.name, cnpj: form.cnpj, notes: form.notes, user_id: user!.id }]);
      if (error) return toast.error(error.message);
      toast.success("Empresa cadastrada");
    }
    setOpen(false);
    refresh();
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir esta empresa? Funcionários e documentos vinculados também serão removidos.")) return;
    const { error } = await supabase.from("companies").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Empresa removida");
    refresh();
  };

  const trialLimitReached = isTrial && list.length >= TRIAL_MAX_COMPANIES;

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Empresas</h1>
          <p className="text-sm text-gray-500">Cadastre, edite e gerencie as empresas da sua base.</p>
        </div>
        <div className="flex items-center gap-2">
          {trialLimitReached && (
            <span className="text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
              {list.length}/{TRIAL_MAX_COMPANIES} empresas — <button onClick={() => navigate("/planos")} className="font-semibold underline">Assine o Pro</button>
            </span>
          )}
          <button
            onClick={openNew}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors shadow-sm",
              trialLimitReached ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            )}
          >
            <Plus className="h-4 w-4" /> Nova empresa
          </button>
        </div>
      </div>

      {/* ── Banner ilustrado ── */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-[#eef3fb]">
        <div className="flex items-center gap-3 px-4 py-4 sm:hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100">
            <Building2 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-800 leading-snug">Organize as informações da sua empresa</h2>
            <p className="mt-0.5 text-xs text-blue-600/80">Dados sempre atualizados e seguros.</p>
          </div>
        </div>
        <div className="hidden sm:block" style={{ height: 160 }}>
          <div className="absolute inset-0"><CityIllustration /></div>
          <div className="absolute left-6 top-1/2 -translate-y-1/2 max-w-xs">
            <h2 className="text-lg font-bold text-gray-800">Organize as informações da sua empresa</h2>
            <p className="mt-1 text-sm text-blue-600/80">Mantenha os dados das empresas sempre atualizados e seguros.</p>
          </div>
        </div>
      </div>

      {/* ── Busca ── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Buscar empresa ou CNPJ..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
          <Filter className="h-4 w-4 text-gray-400" />
          Todas as empresas
          <ChevronRight className="h-4 w-4 text-gray-400 rotate-90" />
        </button>
      </div>

      {/* ── Lista ── */}
      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
          <Building2 className="mx-auto h-9 w-9 text-gray-300" />
          <p className="mt-2 text-sm font-medium text-gray-700">Nenhuma empresa cadastrada</p>
          <button onClick={openNew} className="mt-3 flex items-center gap-1.5 mx-auto rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
            <Plus className="h-3.5 w-3.5" /> Nova empresa
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2 sm:hidden">
            {paginated.map((c) => <CompanyCard key={c.id} c={c} onEdit={openEdit} onRemove={remove} />)}
          </div>

          <div className="hidden sm:block overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 text-left text-[11px] uppercase tracking-wide text-gray-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">Empresa</th>
                  <th className="px-4 py-3 font-semibold">CNPJ</th>
                  <th className="px-4 py-3 font-semibold">Observações</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <CompanyAvatar name={c.name} />
                        <div>
                          <p className="font-semibold text-gray-900">{c.name}</p>
                          <p className="text-[11px] text-gray-400">{(c as any).type ?? "Matriz"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{c.cnpj || "—"}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">{c.notes || "—"}</td>
                    <td className="px-4 py-3"><StatusBadge active={(c as any).active} /></td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openEdit(c)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => remove(c.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
              <p className="text-xs text-gray-400">
                Mostrando {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)} a {Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length} empresa{filtered.length !== 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)} className={cn("flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors", p === page ? "bg-blue-600 text-white" : "border border-gray-200 text-gray-500 hover:bg-gray-50")}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between sm:hidden">
            <p className="text-xs text-gray-400">{filtered.length} empresa{filtered.length !== 1 ? "s" : ""}</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-2 text-xs text-gray-500">{page} / {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Modal ── */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar empresa" : "Nova empresa"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <div>
              <Label className="text-sm font-medium text-gray-700">Nome *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Razão social ou nome fantasia" className="mt-1" />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">CNPJ</Label>
              <Input value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} placeholder="00.000.000/0000-00" className="mt-1" />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Tipo</Label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
                <option value="Matriz">Matriz</option>
                <option value="Filial">Filial</option>
              </select>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Observações</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={submit} className="bg-blue-600 hover:bg-blue-700">
              {editing ? "Salvar" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}