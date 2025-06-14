
import React from "react";
import { Compass } from "lucide-react";

const Navbar = () => (
  <header className="w-full flex items-center justify-between py-4 px-8 bg-card shadow-soft rounded-b-lg">
    <div className="flex items-center gap-2">
      <Compass className="text-terracotta" size={32} />
      <span className="font-bold text-xl tracking-tight text-terracotta">Go Nomad</span>
    </div>
    <nav className="flex items-center gap-8">
      <a href="#" className="font-medium text-neutral-700 hover:text-terracotta transition">Home</a>
      <a href="#" className="font-medium text-neutral-700 hover:text-terracotta transition">Viagem Ativa</a>
      <a href="#" className="font-medium text-neutral-700 hover:text-terracotta transition">Próximas Viagens</a>
      <a href="#" className="font-medium text-neutral-700 hover:text-terracotta transition">Descoberta</a>
      <a href="#" className="font-medium text-neutral-700 hover:text-terracotta transition">Concierge</a>
    </nav>
    <div className="flex items-center gap-2">
      <img
        src="https://randomuser.me/api/portraits/men/63.jpg"
        alt="Avatar"
        className="w-9 h-9 rounded-full border-2 border-terracotta"
      />
    </div>
  </header>
);

export default Navbar;
