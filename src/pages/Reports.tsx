import { useEffect, useMemo, useState } from "react";
import { Download, FileSpreadsheet, FileText as FileIcon } from "lucide-react";
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
    const header = ["Empresa", "Funcionário", "Documento", "Vencimento", "Dias restantes", "Status"];
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
        <h1 className="text-xl font-semibold tracking-tight">Relatórios</h1>
        <p className="text-xs text-muted-foreground">Filtre, visualize e exporte.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 print:hidden">
        <Select value={companyFilter} onValueChange={setCompanyFilter}>
          <SelectTrigger className="h-8 w-[200px] text-sm"><SelectValue placeholder="Empresa" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as empresas</SelectItem>
            {companies.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 w-[180px] text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="expired">Vencidos</SelectItem>
            <SelectItem value="attention">Próximos (7d)</SelectItem>
            <SelectItem value="warning">A vencer (30d)</SelectItem>
            <SelectItem value="ok">Em dia</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="outline" onClick={exportCSV} className="h-8 gap-1.5"><FileSpreadsheet className="h-3.5 w-3.5" />Excel/CSV</Button>
          <Button size="sm" variant="outline" onClick={exportPDF} className="h-8 gap-1.5"><FileIcon className="h-3.5 w-3.5" />PDF</Button>
        </div>
      </div>

      <div className="overflow-hidden rounded border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/60 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-semibold">Empresa</th>
              <th className="px-3 py-2 font-semibold">Funcionário</th>
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
                  <td className="px-3 py-2 tabular-nums text-muted-foreground">{s.daysLeft < 0 ? `−${Math.abs(s.daysLeft)}` : s.daysLeft}</td>
                  <td className="px-3 py-2">
                    <span className={cn("inline-flex rounded-sm px-2 py-0.5 text-[11px] font-medium", s.className)}>
                      {s.key === "expired" ? "VENCIDO" : s.key === "attention" ? "URGENTE" : s.key === "warning" ? "ATENÇÃO" : "EM DIA"}
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
