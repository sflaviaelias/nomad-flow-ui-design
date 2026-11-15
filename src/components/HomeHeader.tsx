import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Compass, Menu, X, ArrowUpRight, UserRound, LogOut } from "lucide-react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { homeFocus } from "@/features/home/HomeAction";

export default function HomeHeader(_props: { user?: { name?: string; avatarUrl?: string } }) {
  const { user, signOut } = useSupabaseAuth();
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const navLink = `inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-accent hover:bg-terracotta-light/50 ${homeFocus}`;
  async function logout() { await signOut(); navigate("/auth/login"); }
  return <header onKeyDown={(event) => { if (event.key === "Escape" && open) { setOpen(false); toggle.current?.focus(); } }} className="border-b border-accent/10 bg-background/95">
    <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-3 px-5 sm:px-8 lg:px-10">
      <Link to="/" aria-label="Go Nomad — Início" className={`flex min-h-11 shrink-0 items-center gap-2.5 rounded-lg ${homeFocus}`}>
        <Compass aria-hidden="true" className="h-8 w-8 stroke-[1.3] text-terra-800" /><span className="text-xl font-semibold tracking-tight text-accent">Go Nomad<span className="text-terra-800">.</span></span>
      </Link>
      <nav aria-label="Navegação principal" className="hidden items-center gap-2 lg:flex">
        {user && <Link to="/trips" className={navLink}>Minhas viagens</Link>}
        <a href="#explore" className={navLink}>Sobre o Go Nomad</a>
        {user ? <><Link to="/profile" className={navLink}><UserRound aria-hidden="true" className="h-4 w-4" />Meu perfil</Link><Link to="/settings" className={navLink}>Configurações</Link><button onClick={() => void logout()} className={navLink}><LogOut aria-hidden="true" className="h-4 w-4" />Sair</button></>
          : <><Link to="/auth/login" className={navLink}>Entrar</Link><Link to="/auth/signup" className={`${navLink} border border-accent/30`}>Criar conta<ArrowUpRight aria-hidden="true" className="h-4 w-4" /></Link></>}
      </nav>
      <button ref={toggle} type="button" aria-label={open ? "Fechar navegação" : "Abrir navegação"} aria-expanded={open} aria-controls="home-mobile-navigation" onClick={() => setOpen(!open)} className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent/25 text-accent lg:hidden ${homeFocus}`}>
        {open ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}
      </button>
    </div>
    {open && <nav id="home-mobile-navigation" aria-label="Navegação móvel" className="grid gap-1 border-t border-accent/10 px-5 py-3 lg:hidden">
      {user ? <><Link to="/trips" className={navLink}>Minhas viagens</Link><Link to="/profile" className={navLink}>Meu perfil</Link><Link to="/settings" className={navLink}>Configurações</Link><button onClick={() => void logout()} className={navLink}>Sair da conta</button></>
        : <><Link to="/auth/signup" className={navLink}>Criar conta</Link><Link to="/auth/login" className={navLink}>Entrar</Link></>}
      <a href="#explore" onClick={() => setOpen(false)} className={navLink}>Sobre o Go Nomad</a>
    </nav>}
  </header>;
}
