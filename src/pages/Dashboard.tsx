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
    <div className="space-y-4">
      <div className="border-b border-border pb-3">
        <h1 className="text-xl font-semibold tracking-tight">Painel</h1>
        <p className="text-xs text-muted-foreground">Visao geral dos vencimentos.</p>
      </div>

      {/* Cards — 2 colunas mobile, 4 desktop */}
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

      {/* Banner de alerta */}
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

      {/* Proximos vencimentos */}
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
            {/* Mobile: cards */}
            <div className="divide-y divide-border sm:hidden">
              {upcoming.map(({ d, s }) => {
                const link = d.employee_id ? `/funcionarios/${d.employee_id}` : `/documentos-empresa`;
                const statusLabel =
                  s.key === "expired" ? "VENCIDO" : s.key === "attention" ? "URGENTE" : "ATENCAO";
                return (
                  <Link
                    key={d.id}
                    to={link}
                    className="flex items-start justify-between gap-3 px-3 py-3 hover:bg-secondary/40"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-[11px] font-medium",
                            s.className
                          )}
                        >
                          <span className={cn("h-1.5 w-1.5 rounded-full", s.dotClass)} />
                          {statusLabel}
                        </span>
                        <span className="truncate text-sm font-medium text-foreground">
                          {d.name}
                          {d.doc_type && (
                            <span className="ml-1 text-[11px] font-normal text-muted-foreground">
                              ({d.doc_type})
                            </span>
                          )}
                        </span>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {d.employee
                          ? `${d.employee.full_name} — ${d.employee.companies?.name ?? ""}`
                          : d.company?.name ?? ""}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Vence em{" "}
                        <span className="font-medium text-foreground">
                          {format(new Date(d.expiry_date), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span
                        className={cn(
                          "whitespace-nowrap text-xs font-medium",
                          s.key === "expired"
                            ? "text-status-expired"
                            : s.key === "attention"
                            ? "text-status-attention"
                            : "text-status-warning"
                        )}
                      >
                        {formatDaysLeft(s.daysLeft)}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Desktop: tabela */}
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
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-[11px] font-medium",
                            s.className
                          )}
                        >
                          <span className={cn("h-1.5 w-1.5 rounded-full", s.dotClass)} />
                          {s.key === "expired" ? "VENCIDO" : s.key === "attention" ? "URGENTE" : "ATENCAO"}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-medium">
                        {d.name}
                        {d.doc_type && (
                          <span className="ml-1.5 text-[11px] font-normal text-muted-foreground">
                            ({d.doc_type})
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {d.employee
                          ? `${d.employee.full_name} — ${d.employee.companies?.name ?? ""}`
                          : d.company?.name ?? ""}
                      </td>
                      <td className="px-3 py-2 tabular-nums">
                        {format(new Date(d.expiry_date), "dd/MM/yyyy", { locale: ptBR })}
                      </td>
                      <td
                        className={cn(
                          "px-3 py-2 text-xs font-medium",
                          s.key === "expired"
                            ? "text-status-expired"
                            : s.key === "attention"
                            ? "text-status-attention"
                            : "text-status-warning"
                        )}
                      >
                        {formatDaysLeft(s.daysLeft)}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <Link
                          to={link}
                          className="inline-flex items-center text-muted-foreground hover:text-primary"
                        >
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
  );
}