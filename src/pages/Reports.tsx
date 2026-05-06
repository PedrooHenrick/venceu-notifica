import { useEffect, useMemo, useState } from "react";
import { FileSpreadsheet, FileText as FileIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getStatus, formatDaysLeft } from "@/lib/status";
import { cn } from "@/lib/utils";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

interface Row {
  id: string;
  name: string;
  expiry_date: string;
  employee?: { full_name: string; companies: { name: string } } | null;
  company?: { name: string } | null;
}

const STATUS_STYLE: Record<string, { bg: string; font: string; label: string }> = {
  expired:   { bg: "FFFDE8E8", font: "FFC0392B", label: "Vencido" },
  attention: { bg: "FFFFF3CD", font: "FFD97706", label: "Urgente" },
  warning:   { bg: "FFFFF8E1", font: "FFB45309", label: "A vencer" },
  ok:        { bg: "FFE8F5E9", font: "FF2E7D32", label: "Em dia" },
};

// ── Helpers de estilo ──────────────────────────────────────────
function headerStyle(bg: string): Partial<ExcelJS.Style> {
  return {
    font: { bold: true, color: { argb: "FFFFFFFF" }, name: "Arial", size: 10 },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: bg } },
    alignment: { horizontal: "center", vertical: "middle", wrapText: true },
    border: {
      bottom: { style: "medium", color: { argb: "FFAAAAAA" } },
      right:  { style: "thin",   color: { argb: "FFDDDDDD" } },
    },
  };
}

function companyRowStyle(): Partial<ExcelJS.Style> {
  return {
    font: { bold: true, color: { argb: "FFFFFFFF" }, name: "Arial", size: 11 },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A5F" } },
    alignment: { horizontal: "left", vertical: "middle" },
  };
}

function employeeStyle(idx: number): Partial<ExcelJS.Style> {
  const bg = idx % 2 === 0 ? "FFFFFFFF" : "FFF4F6FA";
  return {
    font: { bold: true, color: { argb: "FF1A1A1A" }, name: "Arial", size: 10 },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: bg } },
    alignment: { horizontal: "left", vertical: "middle" },
    border: { bottom: { style: "thin", color: { argb: "FFE5E7EB" } } },
  };
}

function docCellStyle(statusKey: string, idx: number): Partial<ExcelJS.Style> {
  const st = STATUS_STYLE[statusKey] ?? STATUS_STYLE.ok;
  return {
    font: { bold: false, color: { argb: st.font }, name: "Arial", size: 10 },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: st.bg } },
    alignment: { horizontal: "center", vertical: "middle" },
    border: {
      bottom: { style: "thin",   color: { argb: "FFE5E7EB" } },
      right:  { style: "thin",   color: { argb: "FFDDDDDD" } },
    },
  };
}

function emptyCellStyle(idx: number): Partial<ExcelJS.Style> {
  const bg = idx % 2 === 0 ? "FFFFFFFF" : "FFF4F6FA";
  return {
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: bg } },
    alignment: { horizontal: "center", vertical: "middle" },
    border: {
      bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
      right:  { style: "thin", color: { argb: "FFDDDDDD" } },
    },
  };
}

export default function Reports() {
  const [rows, setRows] = useState<Row[]>([]);
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    (async () => {
      const [{ data }, { data: cps }] = await Promise.all([
        supabase
          .from("documents")
          .select("id, name, expiry_date, employee:employees(full_name, company_id, companies(name)), company:companies(id, name)")
          .order("expiry_date"),
        supabase.from("companies").select("id, name").order("name"),
      ]);
      setRows((data as any) ?? []);
      setCompanies(cps ?? []);
    })();
  }, []);

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        const s = getStatus(r.expiry_date);
        if (statusFilter !== "all" && s.key !== statusFilter) return false;
        if (companyFilter !== "all") {
          const cName = r.employee?.companies?.name ?? r.company?.name;
          const matchByName = companies.find((c) => c.id === companyFilter)?.name === cName;
          if (!matchByName) return false;
        }
        return true;
      }),
    [rows, statusFilter, companyFilter, companies]
  );

  const exportExcel = async () => {
    const wb = new ExcelJS.Workbook();
    wb.creator = "DocVence";

    // ── Separar docs de funcionários e docs de empresa ──────────
    const empDocs  = filtered.filter((r) => r.employee);
    const compDocs = filtered.filter((r) => !r.employee);

    // ── Todos os tipos de doc únicos (viram colunas) ─────────────
    const empDocTypes  = [...new Set(empDocs.map((r) => r.name))].sort();
    const compDocTypes = [...new Set(compDocs.map((r) => r.name))].sort();

    // ── Agrupar emp: empresa → funcionário → docs ────────────────
    const byCompany: Record<string, Record<string, Record<string, Row>>> = {};
    empDocs.forEach((r) => {
      const comp = r.employee?.companies?.name ?? "Sem empresa";
      const emp  = r.employee?.full_name ?? "—";
      if (!byCompany[comp]) byCompany[comp] = {};
      if (!byCompany[comp][emp]) byCompany[comp][emp] = {};
      byCompany[comp][emp][r.name] = r;
    });

    // ── Agrupar empresa → docs ───────────────────────────────────
    const byCompanyDocs: Record<string, Record<string, Row>> = {};
    compDocs.forEach((r) => {
      const comp = r.company?.name ?? "Sem empresa";
      if (!byCompanyDocs[comp]) byCompanyDocs[comp] = {};
      byCompanyDocs[comp][r.name] = r;
    });

    // ════════════════════════════════════════════════════════════
    // ABA 1 — FUNCIONÁRIOS
    // ════════════════════════════════════════════════════════════
    const wsEmp = wb.addWorksheet("Funcionários");

    // Largura das colunas
    wsEmp.columns = [
      { key: "funcionario", width: 30 },
      ...empDocTypes.map((t) => ({ key: t, width: 18 })),
    ];

    // Cabeçalho fixo
    const empHeader = wsEmp.addRow(["FUNCIONÁRIO", ...empDocTypes]);
    empHeader.height = 24;
    empHeader.getCell(1).style = headerStyle("FF1E3A5F");
    empDocTypes.forEach((_, i) => {
      empHeader.getCell(i + 2).style = headerStyle("FF2C4E80");
    });

    // Linhas por empresa
    Object.entries(byCompany).sort(([a], [b]) => a.localeCompare(b)).forEach(([compName, employees]) => {
      // Linha da empresa (título)
      const compRow = wsEmp.addRow([compName.toUpperCase()]);
      compRow.height = 20;
      // Mesclar da col 1 até última coluna de doc
      const lastCol = empDocTypes.length + 1;
      wsEmp.mergeCells(compRow.number, 1, compRow.number, lastCol);
      compRow.getCell(1).style = companyRowStyle();

      // Linhas dos funcionários
      Object.entries(employees).sort(([a], [b]) => a.localeCompare(b)).forEach(([empName, docs], empIdx) => {
        const rowValues: (string)[] = [empName];
        empDocTypes.forEach((docType) => {
          const doc = docs[docType];
          if (doc) {
            rowValues.push(format(new Date(doc.expiry_date), "dd/MM/yyyy"));
          } else {
            rowValues.push("—");
          }
        });

        const dataRow = wsEmp.addRow(rowValues);
        dataRow.height = 18;
        dataRow.getCell(1).style = employeeStyle(empIdx);

        empDocTypes.forEach((docType, colIdx) => {
          const cell = dataRow.getCell(colIdx + 2);
          const doc = docs[docType];
          if (doc) {
            const s = getStatus(doc.expiry_date);
            cell.style = docCellStyle(s.key, empIdx);
          } else {
            cell.style = emptyCellStyle(empIdx);
          }
        });
      });

      // Linha em branco separadora entre empresas
      const blankRow = wsEmp.addRow([]);
      blankRow.height = 8;
    });

    // ════════════════════════════════════════════════════════════
    // ABA 2 — DOCUMENTOS DA EMPRESA
    // ════════════════════════════════════════════════════════════
    if (compDocTypes.length > 0) {
      const wsComp = wb.addWorksheet("Documentos da Empresa");

      wsComp.columns = [
        { key: "empresa", width: 40 },
        ...compDocTypes.map((t) => ({ key: t, width: 18 })),
      ];

      // Cabeçalho
      const compHeader = wsComp.addRow(["EMPRESA", ...compDocTypes]);
      compHeader.height = 24;
      compHeader.getCell(1).style = headerStyle("FF1E3A5F");
      compDocTypes.forEach((_, i) => {
        compHeader.getCell(i + 2).style = headerStyle("FF2C4E80");
      });

      // Linhas por empresa
      Object.entries(byCompanyDocs).sort(([a], [b]) => a.localeCompare(b)).forEach(([compName, docs], compIdx) => {
        const rowValues: string[] = [compName];
        compDocTypes.forEach((docType) => {
          const doc = docs[docType];
          rowValues.push(doc ? format(new Date(doc.expiry_date), "dd/MM/yyyy") : "—");
        });

        const dataRow = wsComp.addRow(rowValues);
        dataRow.height = 18;
        dataRow.getCell(1).style = employeeStyle(compIdx);

        compDocTypes.forEach((docType, colIdx) => {
          const cell = dataRow.getCell(colIdx + 2);
          const doc = docs[docType];
          if (doc) {
            const s = getStatus(doc.expiry_date);
            cell.style = docCellStyle(s.key, compIdx);
          } else {
            cell.style = emptyCellStyle(compIdx);
          }
        });
      });
    }

    // ── Gerar e baixar ───────────────────────────────────────────
    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `vencimentos-${format(new Date(), "yyyy-MM-dd")}.xlsx`);
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
          <SelectTrigger className="h-8 w-full sm:w-[200px] text-sm">
            <SelectValue placeholder="Empresa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as empresas</SelectItem>
            {companies.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 w-full sm:w-[180px] text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="expired">Vencidos</SelectItem>
            <SelectItem value="attention">Proximos (7d)</SelectItem>
            <SelectItem value="warning">A vencer (30d)</SelectItem>
            <SelectItem value="ok">Em dia</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex w-full gap-2 sm:ml-auto sm:w-auto">
          <Button size="sm" variant="outline" onClick={exportExcel} className="h-8 flex-1 gap-1.5 sm:flex-none">
            <FileSpreadsheet className="h-3.5 w-3.5" />Excel
          </Button>
          <Button size="sm" variant="outline" onClick={exportPDF} className="h-8 flex-1 gap-1.5 sm:flex-none">
            <FileIcon className="h-3.5 w-3.5" />PDF
          </Button>
        </div>
      </div>

      {/* Mobile: cards */}
      <div className="divide-y divide-border overflow-hidden rounded border border-border bg-card sm:hidden">
        {filtered.length === 0 ? (
          <p className="px-3 py-8 text-center text-sm text-muted-foreground">Nenhum resultado.</p>
        ) : (
          filtered.map((r) => {
            const s = getStatus(r.expiry_date);
            const statusLabel =
              s.key === "expired" ? "VENCIDO" :
              s.key === "attention" ? "URGENTE" :
              s.key === "warning" ? "ATENCAO" : "EM DIA";
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
                  <span className={cn("shrink-0 text-xs font-medium",
                    s.key === "expired" ? "text-status-expired" :
                    s.key === "attention" ? "text-status-attention" :
                    s.key === "warning" ? "text-status-warning" : "text-muted-foreground"
                  )}>
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
          })
        )}
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
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">Nenhum resultado.</td>
              </tr>
            ) : (
              filtered.map((r) => {
                const s = getStatus(r.expiry_date);
                return (
                  <tr key={r.id} className="hover:bg-secondary/40">
                    <td className="px-3 py-2">{r.employee?.companies?.name ?? r.company?.name}</td>
                    <td className="px-3 py-2 text-muted-foreground">{r.employee?.full_name ?? "—"}</td>
                    <td className="px-3 py-2 font-medium">{r.name}</td>
                    <td className="px-3 py-2 tabular-nums">{format(new Date(r.expiry_date), "dd/MM/yyyy", { locale: ptBR })}</td>
                    <td className="px-3 py-2 tabular-nums text-muted-foreground">
                      {s.daysLeft < 0 ? `-${Math.abs(s.daysLeft)}` : s.daysLeft}
                    </td>
                    <td className="px-3 py-2">
                      <span className={cn("inline-flex rounded-sm px-2 py-0.5 text-[11px] font-medium", s.className)}>
                        {s.key === "expired" ? "VENCIDO" : s.key === "attention" ? "URGENTE" : s.key === "warning" ? "ATENCAO" : "EM DIA"}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}