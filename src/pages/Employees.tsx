import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Search, ChevronRight, ChevronLeft, FileText, ShieldCheck } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { getStatus } from "@/lib/status";
import { cn } from "@/lib/utils";

const TRIAL_MAX_EMPLOYEES_PER_COMPANY = 5;

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

const PAGE_SIZE = 7;

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}

const avatarColors = [
  "bg-blue-500", "bg-green-500", "bg-orange-500",
  "bg-red-500", "bg-violet-500", "bg-cyan-500",
  "bg-pink-500", "bg-amber-500", "bg-teal-500",
];

function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % avatarColors.length;
  return avatarColors[h];
}

function PeopleIllustration() {
  return (
    <svg viewBox="0 0 340 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
      <rect width="340" height="160" fill="#eef3fb" />
      <ellipse cx="18" cy="145" rx="12" ry="6" fill="#bbf7d0" opacity="0.7"/>
      <path d="M18 145 Q15 130 22 120" stroke="#4ade80" strokeWidth="2" strokeLinecap="round"/>
      <path d="M18 138 Q12 128 8 118" stroke="#4ade80" strokeWidth="2" strokeLinecap="round"/>
      <ellipse cx="22" cy="119" rx="7" ry="5" fill="#86efac" opacity="0.8"/>
      <ellipse cx="8" cy="117" rx="6" ry="4" fill="#86efac" opacity="0.7"/>
      <ellipse cx="310" cy="148" rx="10" ry="5" fill="#bbf7d0" opacity="0.6"/>
      <path d="M310 148 Q308 135 315 125" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round"/>
      <ellipse cx="315" cy="124" rx="6" ry="4" fill="#86efac" opacity="0.7"/>
      <circle cx="270" cy="25" r="4" fill="#93c5fd" opacity="0.5"/>
      <circle cx="285" cy="15" r="2.5" fill="#93c5fd" opacity="0.4"/>
      <circle cx="260" cy="18" r="2" fill="#bfdbfe" opacity="0.5"/>
      <circle cx="50" cy="20" r="3" fill="#93c5fd" opacity="0.4"/>
      <circle cx="38" cy="30" r="2" fill="#bfdbfe" opacity="0.3"/>
      <rect x="55" y="90" width="38" height="55" rx="8" fill="#3b82f6"/>
      <rect x="69" y="80" width="10" height="14" rx="4" fill="#fcd6b0"/>
      <ellipse cx="74" cy="68" rx="16" ry="17" fill="#fcd6b0"/>
      <ellipse cx="74" cy="56" rx="16" ry="10" fill="#1e293b"/>
      <ellipse cx="60" cy="65" rx="6" ry="9" fill="#1e293b"/>
      <ellipse cx="88" cy="65" rx="5" ry="8" fill="#1e293b"/>
      <rect x="130" y="85" width="44" height="60" rx="8" fill="#64748b"/>
      <rect x="146" y="75" width="12" height="14" rx="4" fill="#fcd6b0"/>
      <ellipse cx="152" cy="62" rx="18" ry="19" fill="#fcd6b0"/>
      <ellipse cx="152" cy="47" rx="18" ry="10" fill="#292524"/>
      <rect x="210" y="92" width="38" height="55" rx="8" fill="#fbbf24"/>
      <rect x="224" y="82" width="10" height="14" rx="4" fill="#fde8c8"/>
      <ellipse cx="229" cy="70" rx="16" ry="17" fill="#fde8c8"/>
      <ellipse cx="229" cy="57" rx="16" ry="9" fill="#92400e"/>
      <ellipse cx="74" cy="158" rx="28" ry="4" fill="#c7d7f0" opacity="0.5"/>
      <ellipse cx="152" cy="158" rx="32" ry="4" fill="#c7d7f0" opacity="0.5"/>
      <ellipse cx="229" cy="158" rx="28" ry="4" fill="#c7d7f0" opacity="0.5"/>
    </svg>
  );
}

function aggregate(docs?: DocLite[]) {
  const a = { expired: 0, soon: 0, ok: 0, total: docs?.length ?? 0 };
  docs?.forEach((d) => {
    const s = getStatus(d.expiry_date);
    if (s.key === "expired") a.expired++;
    else if (s.key === "attention" || s.key === "warning") a.soon++;
    else a.ok++;
  });
  return a;
}

function EmployeeCard({ e, onEdit, onRemove }: { e: Employee; onEdit: (e: Employee) => void; onRemove: (id: string) => void }) {
  const a = aggregate(e.documents);
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3">
      <Link to={`/funcionarios/${e.id}`} className="shrink-0">
        <span className={cn("flex h-10 w-10 items-center justify-center rounded-full text-[13px] font-bold text-white", avatarColor(e.full_name))}>
          {initials(e.full_name)}
        </span>
      </Link>
      <Link to={`/funcionarios/${e.id}`} className="min-w-0 flex-1">
        <p className="truncate font-semibold text-gray-900 text-sm">{e.full_name}</p>
        <p className="truncate text-xs text-gray-400">
          {[e.role, e.companies?.name].filter(Boolean).join(" · ") || "—"}
        </p>
        {a.total > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {a.expired > 0 && <span className="inline-flex items-center gap-0.5 rounded-md bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-600"><FileText className="h-2.5 w-2.5" /> {a.expired} vencido{a.expired > 1 ? "s" : ""}</span>}
            {a.soon > 0 && <span className="inline-flex items-center gap-0.5 rounded-md bg-orange-50 px-1.5 py-0.5 text-[10px] font-semibold text-orange-500"><FileText className="h-2.5 w-2.5" /> {a.soon} a vencer</span>}
            {a.ok > 0 && <span className="inline-flex items-center gap-0.5 rounded-md bg-green-50 px-1.5 py-0.5 text-[10px] font-semibold text-green-600"><FileText className="h-2.5 w-2.5" /> {a.ok} ok</span>}
          </div>
        )}
      </Link>
      <div className="flex shrink-0 items-center gap-0.5">
        <button onClick={() => onEdit(e)} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
        <button onClick={() => onRemove(e.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
        <Link to={`/funcionarios/${e.id}`} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"><ChevronRight className="h-4 w-4" /></Link>
      </div>
    </div>
  );
}

export default function Employees() {
  const { user } = useAuth();
  const { isTrial } = useSubscription();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState({ full_name: "", cpf: "", role: "", company_id: "" });
  const [filter, setFilter] = useState("");
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const { data: list = [] } = useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data } = await supabase.from("employees").select("*, companies(name), documents(expiry_date)").order("full_name");
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
    queryClient.invalidateQueries({ queryKey: ["employees"] });
    queryClient.invalidateQueries({ queryKey: ["companies"] });
  };

  // Conta funcionários por empresa
  const employeeCountByCompany = useMemo(() => {
    const counts: Record<string, number> = {};
    list.forEach((e) => {
      counts[e.company_id] = (counts[e.company_id] ?? 0) + 1;
    });
    return counts;
  }, [list]);

  const checkTrialLimit = (companyId: string): boolean => {
    if (!isTrial) return true;
    const count = employeeCountByCompany[companyId] ?? 0;
    return count < TRIAL_MAX_EMPLOYEES_PER_COMPANY;
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
      // Verifica limite do trial por empresa
      if (isTrial && !checkTrialLimit(parsed.data.company_id)) {
        const count = employeeCountByCompany[parsed.data.company_id] ?? 0;
        toast.error(`Limite de ${TRIAL_MAX_EMPLOYEES_PER_COMPANY} funcionários por empresa atingido no período de teste.`, {
          description: "Assine o plano Pro para cadastrar funcionários ilimitados.",
          action: { label: "Ver planos", onClick: () => navigate("/planos") },
        });
        setOpen(false);
        return;
      }
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

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Verifica se empresa selecionada no form atingiu o limite
  const selectedCompanyLimitReached = isTrial && form.company_id && !checkTrialLimit(form.company_id);

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Funcionários</h1>
          <p className="text-sm text-gray-500">Gerencie sua equipe e os documentos com mais praticidade.</p>
        </div>
        <button
          onClick={openNew}
          disabled={companies.length === 0}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> Novo funcionário
        </button>
      </div>

      

      {/* ── Banner ilustrado ── */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-[#eef3fb]">
        <div className="flex items-center gap-3 px-4 py-4 sm:hidden">
          <div className="h-16 w-16 shrink-0"><PeopleIllustration /></div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-gray-800 leading-snug">Tudo da sua equipe em um só lugar</h2>
            <p className="mt-0.5 text-xs text-blue-600/80 leading-snug">Visualize datas de documentos de forma rápida e segura.</p>
          </div>
          <ShieldCheck className="h-7 w-7 shrink-0 text-blue-400" />
        </div>
        <div className="hidden sm:block" style={{ height: 160 }}>
          <div className="absolute left-0 top-0 h-full w-[320px]"><PeopleIllustration /></div>
          <div className="absolute left-[300px] top-1/2 -translate-y-1/2 max-w-[260px]">
            <h2 className="text-base font-bold text-gray-800">Tudo da sua equipe em um só lugar</h2>
            <p className="mt-1 text-sm text-blue-600/80">Visualize datas de documentos em um só lugar, de forma rápida e segura.</p>
          </div>
          <div className="absolute right-8 top-1/2 -translate-y-1/2 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 border border-blue-100">
            <ShieldCheck className="h-8 w-8 text-blue-400" />
          </div>
        </div>
      </div>

      {/* ── Busca + Filtro empresa ── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={filter}
            onChange={(e) => { setFilter(e.target.value); setPage(1); }}
            placeholder="Buscar por nome, CPF ou cargo..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <Select value={companyFilter} onValueChange={(v) => { setCompanyFilter(v); setPage(1); }}>
          <SelectTrigger className="h-10 w-full sm:w-[200px] rounded-xl border-gray-200 text-sm">
            <SelectValue placeholder="Todas as empresas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as empresas</SelectItem>
            {companies.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
                {isTrial && (
                  <span className="ml-2 text-xs text-gray-400">
                    ({employeeCountByCompany[c.id] ?? 0}/{TRIAL_MAX_EMPLOYEES_PER_COMPANY})
                  </span>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Lista ── */}
      {companies.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
          <p className="text-sm font-medium text-gray-700">Cadastre uma empresa primeiro</p>
          <p className="text-xs text-gray-400 mt-1">Funcionários precisam estar vinculados a uma empresa.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-400">
          Nenhum funcionário encontrado.
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2 sm:hidden">
            {paginated.map((e) => <EmployeeCard key={e.id} e={e} onEdit={openEdit} onRemove={remove} />)}
          </div>

          <div className="hidden sm:block overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 text-left text-[11px] uppercase tracking-wide text-gray-400">
                <tr>
                  <th className="px-4 py-3 font-semibold"><span className="flex items-center gap-1">Funcionário <ChevronRight className="h-3 w-3 rotate-90" /></span></th>
                  <th className="px-4 py-3 font-semibold">CPF</th>
                  <th className="px-4 py-3 font-semibold">Cargo</th>
                  <th className="px-4 py-3 font-semibold">Empresa</th>
                  <th className="px-4 py-3 text-center font-semibold">Documentos</th>
                  <th className="px-4 py-3 text-right font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.map((e) => {
                  const a = aggregate(e.documents);
                  return (
                    <tr key={e.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-3">
                        <Link to={`/funcionarios/${e.id}`} className="flex items-center gap-3">
                          <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white", avatarColor(e.full_name))}>
                            {initials(e.full_name)}
                          </span>
                          <span className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">{e.full_name}</span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{e.cpf || "—"}</td>
                      <td className="px-4 py-3 text-gray-500">{e.role || "—"}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs uppercase">{e.companies?.name ?? "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          {a.total === 0 ? <span className="text-gray-300">—</span> : (
                            <>
                              {a.expired > 0 && <span className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-600"><FileText className="h-3 w-3" /> {a.expired}</span>}
                              {a.soon > 0 && <span className="inline-flex items-center gap-1 rounded-lg bg-orange-50 px-2 py-1 text-[11px] font-semibold text-orange-500"><FileText className="h-3 w-3" /> {a.soon}</span>}
                              {a.ok > 0 && <span className="inline-flex items-center gap-1 rounded-lg bg-green-50 px-2 py-1 text-[11px] font-semibold text-green-600"><FileText className="h-3 w-3" /> {a.ok}</span>}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(e)} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
                          <button onClick={() => remove(e.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                          <Link to={`/funcionarios/${e.id}`} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"><ChevronRight className="h-4 w-4" /></Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
              <p className="text-xs text-gray-400">
                Mostrando {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)} a {Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length} funcionário{filtered.length !== 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-40 transition-colors"><ChevronLeft className="h-4 w-4" /></button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)} className={cn("flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors", p === page ? "bg-blue-600 text-white" : "border border-gray-200 text-gray-500 hover:bg-gray-50")}>{p}</button>
                ))}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-40 transition-colors"><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between sm:hidden">
            <p className="text-xs text-gray-400">{filtered.length} funcionário{filtered.length !== 1 ? "s" : ""}</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-40 transition-colors"><ChevronLeft className="h-4 w-4" /></button>
              <span className="px-2 text-xs text-gray-500">{page} / {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-40 transition-colors"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        </>
      )}

      {/* ── Modal ── */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar funcionário" : "Novo funcionário"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <div>
              <Label className="text-sm font-medium text-gray-700">Nome completo *</Label>
              <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="mt-1" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-sm font-medium text-gray-700">CPF</Label>
                <Input value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Cargo / função</Label>
                <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Empresa *</Label>
              <Select value={form.company_id} onValueChange={(v) => setForm({ ...form, company_id: v })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                      {isTrial && (
                        <span className={cn("ml-2 text-xs", (employeeCountByCompany[c.id] ?? 0) >= TRIAL_MAX_EMPLOYEES_PER_COMPANY ? "text-red-500" : "text-gray-400")}>
                          ({employeeCountByCompany[c.id] ?? 0}/{TRIAL_MAX_EMPLOYEES_PER_COMPANY})
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCompanyLimitReached && (
                <p className="mt-1.5 text-xs text-red-500">
                  Limite atingido para esta empresa.{" "}
                  <button onClick={() => { setOpen(false); navigate("/planos"); }} className="underline font-semibold">Assine o Pro</button>
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button
              onClick={submit}
              disabled={!editing && selectedCompanyLimitReached}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {editing ? "Salvar" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}