import { useEffect, useMemo, useState } from "react";
import { FileSpreadsheet, FileText as FileIcon, ChevronDown, ChevronUp, Building2, User } from "lucide-react";
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

// ── Badge de status ────────────────────────────────────────────
function StatusBadge({ statusKey, daysLeft }: { statusKey: string; daysLeft: number }) {
  const map: Record<string, { label: string; className: string }> = {
    expired:   { label: "VENCIDO",  className: "bg-red-100 text-red-700 border border-red-200" },
    attention: { label: "ATENCAO",  className: "bg-amber-100 text-amber-700 border border-amber-200" },
    warning:   { label: "A VENCER", className: "bg-yellow-100 text-yellow-700 border border-yellow-200" },
    ok:        { label: "EM DIA",   className: "bg-emerald-100 text-emerald-700 border border-emerald-200" },
  };
  const s = map[statusKey] ?? map.ok;
  return (
    <span className={cn("inline-flex items-center rounded-sm px-1.5 py-0.5 text-[10px] font-semibold whitespace-nowrap", s.className)}>
      {s.label}
    </span>
  );
}

// ── Célula de documento (data + status) ───────────────────────
function DocCell({ doc }: { doc: Row | undefined }) {
  if (!doc) return <span className="text-muted-foreground/30 text-xs">—</span>;
  const s = getStatus(doc.expiry_date);
  const colorMap: Record<string, string> = {
    expired:   "text-red-600",
    attention: "text-amber-600",
    warning:   "text-yellow-600",
    ok:        "text-emerald-600",
  };
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className={cn("text-xs font-medium tabular-nums", colorMap[s.key])}>
        {format(new Date(doc.expiry_date), "dd/MM/yy")}
      </span>
      <StatusBadge statusKey={s.key} daysLeft={s.daysLeft} />
    </div>
  );
}

// ── Card mobile de funcionário ─────────────────────────────────
function EmployeeMobileCard({ name, docs }: { name: string; docs: Record<string, Row> }) {
  const [open, setOpen] = useState(false);
  const docList = Object.entries(docs);
  const hasIssue = docList.some(([, d]) => {
    const s = getStatus(d.expiry_date);
    return s.key === "expired" || s.key === "attention";
  });

  return (
    <div className={cn("rounded border bg-card overflow-hidden", hasIssue ? "border-amber-200" : "border-border")}>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-3 py-2.5 text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground truncate">{name}</span>
          {hasIssue && <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-muted-foreground">{docList.length} docs</span>
          {open ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
        </div>
      </button>
      {open && (
        <div className="border-t border-border divide-y divide-border">
          {docList.map(([docName, doc]) => {
            const s = getStatus(doc.expiry_date);
            return (
              <div key={docName} className="flex items-center justify-between px-3 py-2 gap-3">
                <span className="text-xs text-muted-foreground truncate flex-1">{docName}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs tabular-nums text-foreground">
                    {format(new Date(doc.expiry_date), "dd/MM/yyyy")}
                  </span>
                  <StatusBadge statusKey={s.key} daysLeft={s.daysLeft} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Bloco de empresa (desktop) ─────────────────────────────────
function CompanyBlock({
  companyName,
  employees,
  docTypes,
}: {
  companyName: string;
  employees: Record<string, Record<string, Row>>;
  docTypes: string[];
}) {
  const empList = Object.entries(employees).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="overflow-hidden rounded border border-border bg-card">
      {/* Cabeçalho empresa */}
      <div className="flex items-center gap-2 bg-[#1E3A5F] px-3 py-2">
        <Building2 className="h-3.5 w-3.5 text-white/70 shrink-0" />
        <span className="text-xs font-bold uppercase tracking-wide text-white">{companyName}</span>
      </div>

      {/* Tabela desktop */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/40 text-left">
            <tr>
              <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap w-48">
                Funcionário
              </th>
              {docTypes.map((dt) => (
                <th key={dt} className="px-2 py-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground text-center whitespace-nowrap max-w-[120px]">
                  <span className="block truncate" title={dt}>{dt}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {empList.map(([empName, docs], idx) => (
              <tr key={empName} className={cn(idx % 2 === 0 ? "bg-white" : "bg-secondary/20", "hover:bg-secondary/40")}>
                <td className="px-3 py-2.5 font-medium text-sm whitespace-nowrap">{empName}</td>
                {docTypes.map((dt) => (
                  <td key={dt} className="px-2 py-2 text-center">
                    <DocCell doc={docs[dt]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards mobile */}
      <div className="sm:hidden divide-y divide-border p-2 space-y-1.5">
        {empList.map(([empName, docs]) => (
          <EmployeeMobileCard key={empName} name={empName} docs={docs} />
        ))}
      </div>
    </div>
  );
}

// ── Bloco documentos da empresa ────────────────────────────────
function CompanyDocsBlock({
  companyName,
  docs,
  docTypes,
}: {
  companyName: string;
  docs: Record<string, Row>;
  docTypes: string[];
}) {
  return (
    <div className="overflow-hidden rounded border border-border bg-card">
      <div className="flex items-center gap-2 bg-[#2C4E80] px-3 py-2">
        <Building2 className="h-3.5 w-3.5 text-white/70 shrink-0" />
        <span className="text-xs font-bold uppercase tracking-wide text-white">{companyName}</span>
        <span className="ml-1 text-[10px] text-white/50">(documentos da empresa)</span>
      </div>

      {/* Desktop */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/40 text-left">
            <tr>
              {docTypes.map((dt) => (
                <th key={dt} className="px-2 py-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground text-center whitespace-nowrap">
                  {dt}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {docTypes.map((dt) => (
                <td key={dt} className="px-2 py-3 text-center">
                  <DocCell doc={docs[dt]} />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="sm:hidden divide-y divide-border">
        {docTypes.map((dt) => {
          const doc = docs[dt];
          const s = doc ? getStatus(doc.expiry_date) : null;
          return (
            <div key={dt} className="flex items-center justify-between px-3 py-2 gap-3">
              <span className="text-xs text-muted-foreground truncate flex-1">{dt}</span>
              {doc && s ? (
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs tabular-nums text-foreground">
                    {format(new Date(doc.expiry_date), "dd/MM/yyyy")}
                  </span>
                  <StatusBadge statusKey={s.key} daysLeft={s.daysLeft} />
                </div>
              ) : (
                <span className="text-xs text-muted-foreground/40">—</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ══════════════════════════════════════════════════════════════
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

  // ── Agrupar dados ──────────────────────────────────────────
  const { byCompanyEmp, byCompanyDocs, empDocTypes, compDocTypes } = useMemo(() => {
    const empDocs  = filtered.filter((r) => r.employee);
    const compDocs = filtered.filter((r) => !r.employee);

    const empDocTypes  = [...new Set(empDocs.map((r) => r.name))].sort();
    const compDocTypes = [...new Set(compDocs.map((r) => r.name))].sort();

    // empresa → funcionário → docName → Row
    const byCompanyEmp: Record<string, Record<string, Record<string, Row>>> = {};
    empDocs.forEach((r) => {
      const comp = r.employee?.companies?.name ?? "Sem empresa";
      const emp  = r.employee?.full_name ?? "—";
      if (!byCompanyEmp[comp]) byCompanyEmp[comp] = {};
      if (!byCompanyEmp[comp][emp]) byCompanyEmp[comp][emp] = {};
      byCompanyEmp[comp][emp][r.name] = r;
    });

    // empresa → docName → Row
    const byCompanyDocs: Record<string, Record<string, Row>> = {};
    compDocs.forEach((r) => {
      const comp = r.company?.name ?? "Sem empresa";
      if (!byCompanyDocs[comp]) byCompanyDocs[comp] = {};
      byCompanyDocs[comp][r.name] = r;
    });

    return { byCompanyEmp, byCompanyDocs, empDocTypes, compDocTypes };
  }, [filtered]);

  // ── Export Excel ───────────────────────────────────────────
  const exportExcel = async () => {
    const wb = new ExcelJS.Workbook();
    wb.creator = "DocVence";

    // ABA FUNCIONÁRIOS
    const wsEmp = wb.addWorksheet("Funcionários");
    wsEmp.columns = [
      { key: "funcionario", width: 30 },
      ...empDocTypes.map((t) => ({ key: t, width: 18 })),
    ];
    const empHeader = wsEmp.addRow(["FUNCIONÁRIO", ...empDocTypes]);
    empHeader.height = 24;
    empHeader.eachCell((cell, col) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" }, name: "Arial", size: 10 };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: col === 1 ? "FF1E3A5F" : "FF2C4E80" } };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      cell.border = { bottom: { style: "medium", color: { argb: "FFAAAAAA" } }, right: { style: "thin", color: { argb: "FFDDDDDD" } } };
    });

    Object.entries(byCompanyEmp).sort(([a], [b]) => a.localeCompare(b)).forEach(([compName, employees]) => {
      const compRow = wsEmp.addRow([compName.toUpperCase()]);
      compRow.height = 20;
      wsEmp.mergeCells(compRow.number, 1, compRow.number, empDocTypes.length + 1);
      compRow.getCell(1).style = {
        font: { bold: true, color: { argb: "FFFFFFFF" }, name: "Arial", size: 11 },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A5F" } },
        alignment: { horizontal: "left", vertical: "middle" },
      };

      Object.entries(employees).sort(([a], [b]) => a.localeCompare(b)).forEach(([empName, docs], empIdx) => {
        const vals: string[] = [empName, ...empDocTypes.map((dt) => {
          const doc = docs[dt];
          return doc ? format(new Date(doc.expiry_date), "dd/MM/yyyy") : "—";
        })];
        const dataRow = wsEmp.addRow(vals);
        dataRow.height = 18;
        const rowBg = empIdx % 2 === 0 ? "FFFFFFFF" : "FFF4F6FA";
        dataRow.getCell(1).style = {
          font: { bold: true, color: { argb: "FF1A1A1A" }, name: "Arial", size: 10 },
          fill: { type: "pattern", pattern: "solid", fgColor: { argb: rowBg } },
          alignment: { horizontal: "left", vertical: "middle" },
          border: { bottom: { style: "thin", color: { argb: "FFE5E7EB" } } },
        };
        empDocTypes.forEach((dt, colIdx) => {
          const cell = dataRow.getCell(colIdx + 2);
          const doc = docs[dt];
          if (doc) {
            const s = getStatus(doc.expiry_date);
            const st = STATUS_STYLE[s.key] ?? STATUS_STYLE.ok;
            cell.style = {
              font: { bold: true, color: { argb: st.font }, name: "Arial", size: 10 },
              fill: { type: "pattern", pattern: "solid", fgColor: { argb: st.bg } },
              alignment: { horizontal: "center", vertical: "middle" },
              border: { bottom: { style: "thin", color: { argb: "FFE5E7EB" } }, right: { style: "thin", color: { argb: "FFDDDDDD" } } },
            };
          } else {
            cell.style = {
              fill: { type: "pattern", pattern: "solid", fgColor: { argb: rowBg } },
              alignment: { horizontal: "center", vertical: "middle" },
              border: { bottom: { style: "thin", color: { argb: "FFE5E7EB" } }, right: { style: "thin", color: { argb: "FFDDDDDD" } } },
            };
          }
        });
      });
      wsEmp.addRow([]).height = 8;
    });

    // ABA DOCS EMPRESA
    if (compDocTypes.length > 0) {
      const wsComp = wb.addWorksheet("Documentos da Empresa");
      wsComp.columns = [{ key: "empresa", width: 40 }, ...compDocTypes.map((t) => ({ key: t, width: 18 }))];
      const compHeader = wsComp.addRow(["EMPRESA", ...compDocTypes]);
      compHeader.height = 24;
      compHeader.eachCell((cell, col) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" }, name: "Arial", size: 10 };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: col === 1 ? "FF1E3A5F" : "FF2C4E80" } };
        cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
        cell.border = { bottom: { style: "medium", color: { argb: "FFAAAAAA" } } };
      });
      Object.entries(byCompanyDocs).sort(([a], [b]) => a.localeCompare(b)).forEach(([compName, docs], compIdx) => {
        const vals = [compName, ...compDocTypes.map((dt) => docs[dt] ? format(new Date(docs[dt].expiry_date), "dd/MM/yyyy") : "—")];
        const dataRow = wsComp.addRow(vals);
        dataRow.height = 18;
        const rowBg = compIdx % 2 === 0 ? "FFFFFFFF" : "FFF4F6FA";
        dataRow.getCell(1).style = {
          font: { bold: true, color: { argb: "FF1A1A1A" }, name: "Arial", size: 10 },
          fill: { type: "pattern", pattern: "solid", fgColor: { argb: rowBg } },
          alignment: { horizontal: "left", vertical: "middle" },
        };
        compDocTypes.forEach((dt, colIdx) => {
          const cell = dataRow.getCell(colIdx + 2);
          const doc = docs[dt];
          if (doc) {
            const s = getStatus(doc.expiry_date);
            const st = STATUS_STYLE[s.key] ?? STATUS_STYLE.ok;
            cell.style = {
              font: { bold: true, color: { argb: st.font }, name: "Arial", size: 10 },
              fill: { type: "pattern", pattern: "solid", fgColor: { argb: st.bg } },
              alignment: { horizontal: "center", vertical: "middle" },
            };
          } else {
            cell.style = { fill: { type: "pattern", pattern: "solid", fgColor: { argb: rowBg } }, alignment: { horizontal: "center", vertical: "middle" } };
          }
        });
      });
    }

    const buffer = await wb.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
      `vencimentos-${format(new Date(), "yyyy-MM-dd")}.xlsx`
    );
  };

  const exportPDF = () => window.print();

  const hasData = Object.keys(byCompanyEmp).length > 0 || Object.keys(byCompanyDocs).length > 0;

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

      {/* Conteúdo */}
      {!hasData ? (
        <div className="rounded border border-border bg-card px-3 py-10 text-center text-sm text-muted-foreground">
          Nenhum resultado encontrado.
        </div>
      ) : (
        <div className="space-y-4">
          {/* Blocos por empresa - funcionários */}
          {Object.entries(byCompanyEmp)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([compName, employees]) => (
              <CompanyBlock
                key={compName}
                companyName={compName}
                employees={employees}
                docTypes={empDocTypes}
              />
            ))}

          {/* Documentos da empresa (sem funcionário) */}
          {Object.keys(byCompanyDocs).length > 0 && (
            <>
              <div className="border-t border-border pt-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Documentos da Empresa
                </p>
              </div>
              {Object.entries(byCompanyDocs)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([compName, docs]) => (
                  <CompanyDocsBlock
                    key={compName}
                    companyName={compName}
                    docs={docs}
                    docTypes={compDocTypes}
                  />
                ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}