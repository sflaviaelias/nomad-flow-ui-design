import { useEffect, useRef, type ButtonHTMLAttributes } from "react";
import { Link, useLocation } from "react-router-dom";
import { homeFocus } from "@/features/home/HomeAction";
import { cn } from "@/lib/utils";

export function EntryButton({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} className={cn("inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-terracotta-dark px-5 py-3 text-sm font-semibold text-white hover:bg-accent disabled:cursor-wait disabled:opacity-60", homeFocus, className)} />;
}
export function EntryError({ message, id }: { message: string | null; id: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => { if (message) ref.current?.focus(); }, [message]);
  return message ? <p id={id} ref={ref} role="alert" tabIndex={-1} className="rounded-xl border border-terracotta-dark/40 bg-terracotta-light/40 p-4 text-sm leading-relaxed outline-none">{message}</p> : null;
}
export function EntryAlternatives({ signup = false }: { signup?: boolean }) {
  const { state } = useLocation();
  return <div className="mt-6 space-y-3 border-t border-accent/15 pt-5 text-sm">
    <Link to={signup ? "/auth/signup" : "/auth/login"} state={state} className={`flex min-h-11 items-center rounded-lg font-semibold underline underline-offset-4 ${homeFocus}`}>{signup ? "Criar conta" : "Já tem conta? Entrar"}</Link>
    <Link to="/demo" className={`flex min-h-11 items-center rounded-lg text-accent/85 ${homeFocus}`}>Explorar como convidado · sem cadastro</Link>
  </div>;
}
