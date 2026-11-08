import { localDateKey } from "./trips";
export function tripStatus(start: string, end: string, today = localDateKey()) {
  if (today < start) return { label: "Planejada", className: "bg-terracotta-light text-accent" };
  if (today > end) return { label: "Concluída", className: "bg-background-dark text-accent" };
  return { label: "Em viagem", className: "bg-accent text-white" };
}
export function tripDuration(start: string, end: string) {
  const days = Math.round((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86_400_000) + 1;
  return Number.isFinite(days) && days > 0 ? `${days} ${days === 1 ? "dia" : "dias"}` : "Duração não informada";
}
export function tripDate(date: string) {
  const parsed = new Date(`${date}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? "Data não informada" : new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(parsed);
}
export function tripBudget(value: number | null, currency: string | null) {
  if (value === null || !Number.isFinite(value)) return "Não informado";
  try { return new Intl.NumberFormat("pt-BR", { style: "currency", currency: currency || "BRL" }).format(value); }
  catch { return "Não informado"; }
}
