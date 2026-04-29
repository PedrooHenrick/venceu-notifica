import { differenceInCalendarDays, parseISO } from "date-fns";

export type DocStatus = "expired" | "attention" | "warning" | "ok";

export interface StatusInfo {
  key: DocStatus;
  label: string;
  daysLeft: number;
  className: string; // bg + text combo for badge
  dotClass: string;
}

export function getStatus(expiry: string | Date): StatusInfo {
  const date = typeof expiry === "string" ? parseISO(expiry) : expiry;
  const days = differenceInCalendarDays(date, new Date());

  if (days < 0) {
    return {
      key: "expired",
      label: "Vencido",
      daysLeft: days,
      className: "bg-status-expired-soft text-status-expired",
      dotClass: "bg-status-expired",
    };
  }
  if (days <= 7) {
    return {
      key: "attention",
      label: "Vence em 7 dias",
      daysLeft: days,
      className: "bg-status-attention-soft text-status-attention",
      dotClass: "bg-status-attention",
    };
  }
  if (days <= 30) {
    return {
      key: "warning",
      label: "Vence em 30 dias",
      daysLeft: days,
      className: "bg-status-warning-soft text-status-warning",
      dotClass: "bg-status-warning",
    };
  }
  return {
    key: "ok",
    label: "Em dia",
    daysLeft: days,
    className: "bg-status-ok-soft text-status-ok",
    dotClass: "bg-status-ok",
  };
}

export function formatDaysLeft(days: number): string {
  if (days < 0) return `${Math.abs(days)} ${Math.abs(days) === 1 ? "dia atrás" : "dias atrás"}`;
  if (days === 0) return "Vence hoje";
  return `${days} ${days === 1 ? "dia" : "dias"}`;
}
