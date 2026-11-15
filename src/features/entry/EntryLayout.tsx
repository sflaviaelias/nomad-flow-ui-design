import type { ReactNode } from "react";
import { Compass, ArrowLeft, Route } from "lucide-react";
import { Link } from "react-router-dom";
import { homeFocus } from "@/features/home/HomeAction";
import "./entry.css";

export default function EntryLayout({ title, description, eyebrow = "O seu próximo capítulo", children }: { title: string; description: string; eyebrow?: string; children: ReactNode }) {
  return <div lang="pt-BR" className="entry-shell min-h-screen bg-background text-accent">
    <header className="border-b border-accent/10"><nav aria-label="Navegação de acesso" className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-3 px-5 sm:px-8 lg:px-10">
      <Link to="/" aria-label="Go Nomad — Início" className={`flex min-h-11 items-center gap-2 rounded-lg text-xl font-semibold tracking-tight ${homeFocus}`}><Compass aria-hidden="true" className="h-8 w-8 stroke-[1.3] text-terra-800" />Go Nomad.</Link>
      <Link to="/" className={`inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-medium ${homeFocus}`}><ArrowLeft aria-hidden="true" className="h-4 w-4" />Voltar para Home</Link>
    </nav></header>
    <main className="mx-auto grid max-w-7xl items-start gap-7 px-5 py-8 sm:px-8 sm:py-12 lg:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)] lg:gap-16 lg:px-10 lg:py-16">
      <div className="min-w-0 lg:sticky lg:top-10"><p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-terra-800">{eyebrow}</p><h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">{title}</h1><p className="mt-4 max-w-lg text-sm leading-relaxed text-accent/85 sm:text-base">{description}</p>
        <div aria-hidden="true" className="relative mt-10 hidden max-w-sm overflow-hidden rounded-3xl border border-accent/10 bg-gradient-to-br from-cream to-terracotta-light p-8 lg:block"><Route className="mb-7 h-10 w-10 stroke-1 text-[#244956]" /><svg viewBox="0 0 300 100" className="w-full fill-none"><path d="M-10 70Q60 10 140 65T320 42M-10 95Q80 40 180 90T320 60" stroke="#AD4F36" strokeWidth="1" /><path d="M20 50Q80 0 200 25T280 45" stroke="#244956" strokeWidth="1" strokeDasharray="3 5" /></svg></div>
      </div>
      <section aria-label={title} className="min-w-0 rounded-3xl border border-accent/15 bg-white p-5 shadow-soft sm:p-8">{children}</section>
    </main>
  </div>;
}
