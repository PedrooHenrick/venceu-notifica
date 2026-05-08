import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  ChevronRight,
  Folder,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { getStatus, formatDaysLeft } from "@/lib/status";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface DocRow {
  id: string;
  name: string;
  expiry_date: string;
  doc_type: string | null;
  employee_id: string | null;
  employee: { id: string; full_name: string; companies: { name: string } } | null;
  company: { name: string } | null;
}

function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <div className="h-32 w-32 rounded-full bg-gray-100" />;

  let offset = 0;
  const r = 40, cx = 50, cy = 50, circ = 2 * Math.PI * r;
  const slices = data.map((d) => {
    const pct = d.value / total;
    const dash = pct * circ;
    const gap = circ - dash;
    const slice = { ...d, dash, gap, offset };
    offset += dash;
    return slice;
  });

  return (
    <svg viewBox="0 0 100 100" className="h-24 w-24 shrink-0 -rotate-90">
      {slices.map((s, i) => (
        <circle key={i} cx={cx} cy={cy} r={r}
          fill="none" stroke={s.color} strokeWidth="18"
          strokeDasharray={`${s.dash} ${s.gap}`}
          strokeDashoffset={-s.offset} />
      ))}
      <circle cx={cx} cy={cy} r="31" fill="white" />
    </svg>
  );
}

function UpcomingCard({ d, s }: { d: DocRow; s: ReturnType<typeof getStatus> }) {
  const link = d.employee_id ? `/funcionarios/${d.employee_id}` : `/documentos-empresa`;
  const dotColor =
    s.key === "expired" ? "bg-red-500" :
    s.key === "attention" ? "bg-red-400" : "bg-yellow-400";
  const badgeClass =
    s.key === "expired"
      ? "bg-red-50 text-red-600"
      : s.key === "attention"
      ? "bg-orange-50 text-orange-500"
      : "bg-yellow-50 text-yellow-600";

  return (
    <div className="flex items-start gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
      <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", dotColor)} />
      <div className="min-w-0 flex-1">
        <p className="font-medium text-gray-800 text-sm truncate">{d.name}</p>
        <p className="text-xs text-gray-400 truncate mt-0.5">
          {d.employee
            ? `${d.employee.full_name} — ${d.employee.companies?.name ?? ""}`
            : d.company?.name ?? "—"}
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <span className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-semibold", badgeClass)}>
            {format(new Date(d.expiry_date), "dd/MM/yyyy", { locale: ptBR })}
          </span>
        </div>
      </div>
      <Link
        to={link}
        className="shrink-0 flex items-center gap-0.5 text-xs font-medium text-blue-600 hover:underline mt-0.5"
      >
        Ver <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [docs, setDocs] = useState<DocRow[]>([]);

  const displayName = user?.user_metadata?.full_name
    ?? user?.email?.split("@")[0]
    ?? "Usuário";

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

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
    .slice(0, 5);

  const byType: Record<string, number> = {};
  docs.forEach((d) => { const k = d.doc_type ?? "Outros"; byType[k] = (byType[k] ?? 0) + 1; });
  const donutColors = ["#3b82f6", "#22c55e", "#f59e0b", "#94a3b8", "#ef4444"];
  const donutData = Object.entries(byType)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, value], i) => ({ label, value, color: donutColors[i] }));

  const recentDocs = [...docs]
    .sort((a, b) => b.id.localeCompare(a.id))
    .slice(0, 3);

  return (
    <div className="space-y-5">
      {/* ── Saudação ── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {greeting}, {displayName} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Aqui está um resumo do que está acontecendo na sua empresa.
        </p>
      </div>

      {/* ── Banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-blue-600 px-5 py-4 text-white">
        <div className="max-w-xs">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
            <Folder className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-base font-bold">Mantenha tudo em dia</h2>
          <p className="mt-1 text-sm text-blue-100">
            Organize os documentos e evite problemas futuros.
          </p>
          <Link
            to="/documentos-empresa"
            className="mt-3 inline-flex items-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
          >
            Ver meus documentos
          </Link>
        </div>
        <div className="absolute right-4 top-1/2 hidden -translate-y-1/2 md:block">
          <div className="flex items-end gap-2 opacity-30">
            <div className="h-16 w-8 rounded-t-lg bg-white" />
            <div className="h-24 w-8 rounded-t-lg bg-white" />
            <div className="h-12 w-8 rounded-t-lg bg-white" />
            <div className="h-20 w-8 rounded-t-lg bg-white" />
          </div>
        </div>
      </div>

      {/* ── Atividades + Donut ── */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Atividades recentes */}
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">Atividades recentes</h2>
          {recentDocs.length === 0 ? (
            <p className="text-xs text-gray-400">Nenhuma atividade ainda.</p>
          ) : (
            <div className="space-y-3">
              {recentDocs.map((d, i) => (
                <div key={d.id} className="flex items-start gap-2.5">
                  <span className={cn(
                    "mt-0.5 h-2 w-2 shrink-0 rounded-full",
                    i === 0 ? "bg-blue-500" : i === 1 ? "bg-blue-400" : "bg-gray-300"
                  )} />
                  <div className="min-w-0">
                    <p className="text-[13px] text-gray-700">
                      <span className="font-medium">{d.name}</span>
                      {d.employee && <> foi vinculado a <span className="font-medium">{d.employee.full_name}</span></>}
                      {d.company && <> pertence a <span className="font-medium">{d.company.name}</span></>}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Vence em {format(new Date(d.expiry_date), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Documentos por tipo */}
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">Documentos por tipo</h2>
          {donutData.length === 0 ? (
            <p className="text-xs text-gray-400">Nenhum documento cadastrado.</p>
          ) : (
            <div className="flex items-center gap-4">
              <DonutChart data={donutData} />
              <div className="space-y-1.5 min-w-0 flex-1">
                {donutData.map((d) => (
                  <div key={d.label} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: d.color }} />
                    <span className="text-[12px] text-gray-600 flex-1 truncate">{d.label}</span>
                    <span className="text-[12px] font-semibold text-gray-800 tabular-nums">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Próximos vencimentos ── */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">Próximos vencimentos</h2>
          <Link to="/relatorios" className="text-xs font-medium text-blue-600 hover:underline">
            Ver relatório completo
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-green-500" />
            <p className="mt-2 text-sm font-medium text-gray-700">Tudo em dia</p>
            <p className="text-xs text-gray-400">Nenhum documento vencendo nos próximos 30 dias.</p>
          </div>
        ) : (
          <>
            {/* Mobile: cards empilhados */}
            <div className="sm:hidden divide-y divide-gray-50">
              {upcoming.map(({ d, s }) => (
                <UpcomingCard key={d.id} d={d} s={s} />
              ))}
            </div>

            {/* Desktop: tabela */}
            <table className="hidden sm:table w-full text-sm">
              <thead className="border-b border-gray-100 text-left text-[11px] uppercase tracking-wide text-gray-400">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Documento</th>
                  <th className="px-4 py-2.5 font-semibold">Vínculo</th>
                  <th className="px-4 py-2.5 font-semibold">Vencimento</th>
                  <th className="px-4 py-2.5 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {upcoming.map(({ d, s }) => {
                  const link = d.employee_id ? `/funcionarios/${d.employee_id}` : `/documentos-empresa`;
                  const dotColor =
                    s.key === "expired" ? "bg-red-500" :
                    s.key === "attention" ? "bg-red-400" : "bg-yellow-400";
                  return (
                    <tr key={d.id} className="hover:bg-gray-50/60">
                      <td className="px-4 py-3 font-medium text-gray-800">
                        <div className="flex items-center gap-2">
                          <span className={cn("h-2 w-2 shrink-0 rounded-full", dotColor)} />
                          {d.name}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {d.employee
                          ? `${d.employee.full_name} — ${d.employee.companies?.name ?? ""}`
                          : d.company?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-gray-700">
                        {format(new Date(d.expiry_date), "dd/MM/yyyy", { locale: ptBR })}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={link}
                          className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
                        >
                          Ver detalhes <ChevronRight className="h-3.5 w-3.5" />
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
  );
}