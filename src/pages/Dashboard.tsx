import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Calendar, CheckCircle2, Clock, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { getStatus, formatDaysLeft } from "@/lib/status";
import { cn } from "@/lib/utils";

interface DocRow {
  id: string;
  name: string;
  expiry_date: string;
  doc_type: string | null;
  employee_id: string | null;
  employee: { id: string; full_name: string; companies: { name: string } } | null;
  company: { name: string } | null;
}

export default function Dashboard() {
  const [docs, setDocs] = useState<DocRow[]>([]);

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
    .slice(0, 12);

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
    <div className="space-y-4">
      <div className="border-b border-border pb-3">
        <h1 className="text-xl font-semibold tracking-tight">Painel</h1>
        <p className="text-xs text-muted-foreground">Visão geral dos vencimentos.</p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className={cn("flex items-center gap-3 rounded border border-border border-l-4 bg-card px-4 py-3", accentMap[c.accent])}>
            <c.icon className="h-5 w-5" />
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{c.label}</div>
              <div className="text-2xl font-bold tabular-nums text-foreground">{c.value}</div>
            </div>
          </div>
        ))}
      </div>

      {counts.expired + counts.in7 > 0 && (
        <div className="flex items-start gap-2.5 rounded border border-status-attention/30 bg-status-attention-soft px-3 py-2.5 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-status-attention" />
          <div>
            <span className="font-semibold text-status-attention">{counts.expired + counts.in7} {counts.expired + counts.in7 === 1 ? "documento precisa" : "documentos precisam"} de atenção esta semana.</span>
            <span className="ml-1 text-foreground/70">Resolva agora para evitar multas.</span>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border bg-secondary/60 px-3 py-2">
          <h2 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Próximos vencimentos</h2>
          <Link to="/relatorios" className="text-[11px] font-medium text-primary hover:underline">Ver relatório completo</Link>
        </div>
        {upcoming.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-status-ok" />
            <p className="mt-2 text-sm font-medium">Tudo em dia</p>
            <p className="text-xs text-muted-foreground">Nenhum documento vencendo nos próximos 30 dias.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-semibold">Status</th>
                <th className="px-3 py-2 font-semibold">Documento</th>
                <th className="px-3 py-2 font-semibold">Vínculo</th>
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
                        {s.key === "expired" ? "VENCIDO" : s.key === "attention" ? "URGENTE" : "ATENÇÃO"}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-medium">{d.name}{d.doc_type && <span className="ml-1.5 text-[11px] font-normal text-muted-foreground">({d.doc_type})</span>}</td>
                    <td className="px-3 py-2 text-muted-foreground">{d.employee ? `${d.employee.full_name} — ${d.employee.companies?.name ?? ""}` : `🏢 ${d.company?.name ?? ""}`}</td>
                    <td className="px-3 py-2 tabular-nums">{format(new Date(d.expiry_date), "dd/MM/yyyy", { locale: ptBR })}</td>
                    <td className={cn("px-3 py-2 text-xs font-medium", s.key === "expired" ? "text-status-expired" : s.key === "attention" ? "text-status-attention" : "text-status-warning")}>
                      {formatDaysLeft(s.daysLeft)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Link to={link} className="inline-flex items-center text-muted-foreground hover:text-primary"><ChevronRight className="h-4 w-4" /></Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
