import { useEffect, useMemo, useState } from "react";
import { FileSpreadsheet, FileText as FileIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getStatus, formatDaysLeft } from "@/lib/status";
import { cn } from "@/lib/utils";

interface Row {
  id: string;
  name: string;
  expiry_date: string;
  employee?: { full_name: string; companies: { name: string } } | null;
  company?: { name: string } | null;
}

export default function Reports() {
  const [rows, setRows] = useState<Row[]>([]);
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    (async () => {
      const [{ data }, { data: cps }] = await Promise.all([
        supabase.from("documents").select("id, name, expiry_date, employee:employees(full_name, company_id, companies(name)), company:companies(id, name)").order("expiry_date"),
        supabase.from("companies").select("id, name").order("name"),
      ]);
      setRows((data as any) ?? []); setCompanies(cps ?? []);
    })();
  }, []);

  const filtered = useMemo(() => rows.filter((r) => {
    const s = getStatus(r.expiry_date);
    if (statusFilter !== "all" && s.key !== statusFilter) return false;
    if (companyFilter !== "all") {
      const cName = r.employee?.companies?.name ?? r.company?.name;
      const matchByName = companies.find((c) => c.id === companyFilter)?.name === cName;
      if (!matchByName) return false;
    }
    return true;
  }), [rows, statusFilter, companyFilter, companies]);

  const exportCSV = () => {
    const header = ["Empresa", "Funcionario", "Documento", "Vencimento", "Dias restantes", "Status"];
    const lines = filtered.map((r) => {
      const s = getStatus(r.expiry_date);
      const company = r.employee?.companies?.name ?? r.company?.name ?? "";
      const employee = r.employee?.full_name ?? "—";
      return [company, employee, r.name, format(new Date(r.expiry_date), "dd/MM/yyyy"), s.daysLeft, s.label];
    });
    const csv = [header, ...lines].map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `vencimentos-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => window.print();

  return (
    <div className="space-y-4">
      <div className="border-b border-border pb-3">
        <h1 className="text-xl font-semibold tracking-tight">Relatorios</h1>
        <p className="text-xs text-muted-foreground">Filtre, visualize e exporte.</p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2 print:hidden">
        <Select value={companyFilter} onValueChange={setCompanyFilter}>
          <SelectTrigger className="h-8 w-full sm:w-[200px] text-sm"><SelectValue placeholder="Empresa" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as empresas</SelectItem>
            {companies.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 w-full sm:w-[180px] text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="expired">Vencidos</SelectItem>
            <SelectItem value="attention">Proximos (7d)</SelectItem>
            <SelectItem value="warning">A vencer (30d)</SelectItem>
            <SelectItem value="ok">Em dia</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex w-full gap-2 sm:ml-auto sm:w-auto">
          <Button size="sm" variant="outline" onClick={exportCSV} className="h-8 flex-1 gap-1.5 sm:flex-none"><FileSpreadsheet className="h-3.5 w-3.5" />Excel/CSV</Button>
          <Button size="sm" variant="outline" onClick={exportPDF} className="h-8 flex-1 gap-1.5 sm:flex-none"><FileIcon className="h-3.5 w-3.5" />PDF</Button>
        </div>
      </div>

      {/* Mobile: cards */}
      <div className="divide-y divide-border overflow-hidden rounded border border-border bg-card sm:hidden">
        {filtered.length === 0 ? (
          <p className="px-3 py-8 text-center text-sm text-muted-foreground">Nenhum resultado.</p>
        ) : filtered.map((r) => {
          const s = getStatus(r.expiry_date);
          const statusLabel = s.key === "expired" ? "VENCIDO" : s.key === "attention" ? "URGENTE" : s.key === "warning" ? "ATENCAO" : "EM DIA";
          return (
            <div key={r.id} className="space-y-1 px-3 py-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn("inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-[11px] font-medium", s.className)}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", s.dotClass)} />
                    {statusLabel}
                  </span>
                  <span className="text-sm font-medium text-foreground">{r.name}</span>
                </div>
                <span className={cn("shrink-0 text-xs font-medium", s.key === "expired" ? "text-status-expired" : s.key === "attention" ? "text-status-attention" : s.key === "warning" ? "text-status-warning" : "text-muted-foreground")}>
                  {formatDaysLeft(s.daysLeft)}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                <span>{r.employee?.companies?.name ?? r.company?.name}</span>
                <span>{r.employee?.full_name ?? "—"}</span>
                <span>{format(new Date(r.expiry_date), "dd/MM/yyyy", { locale: ptBR })}</span>
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
              <th className="px-3 py-2 font-semibold">Empresa</th>
              <th className="px-3 py-2 font-semibold">Funcionario</th>
              <th className="px-3 py-2 font-semibold">Documento</th>
              <th className="px-3 py-2 font-semibold">Vencimento</th>
              <th className="px-3 py-2 font-semibold">Dias</th>
              <th className="px-3 py-2 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">Nenhum resultado.</td></tr>
            ) : filtered.map((r) => {
              const s = getStatus(r.expiry_date);
              return (
                <tr key={r.id} className="hover:bg-secondary/40">
                  <td className="px-3 py-2">{r.employee?.companies?.name ?? r.company?.name}</td>
                  <td className="px-3 py-2 text-muted-foreground">{r.employee?.full_name ?? "—"}</td>
                  <td className="px-3 py-2 font-medium">{r.name}</td>
                  <td className="px-3 py-2 tabular-nums">{format(new Date(r.expiry_date), "dd/MM/yyyy", { locale: ptBR })}</td>
                  <td className="px-3 py-2 tabular-nums text-muted-foreground">{s.daysLeft < 0 ? `-${Math.abs(s.daysLeft)}` : s.daysLeft}</td>
                  <td className="px-3 py-2">
                    <span className={cn("inline-flex rounded-sm px-2 py-0.5 text-[11px] font-medium", s.className)}>
                      {s.key === "expired" ? "VENCIDO" : s.key === "attention" ? "URGENTE" : s.key === "warning" ? "ATENCAO" : "EM DIA"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}