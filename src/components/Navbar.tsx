import React from "react";
import { Compass, Menu } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const NAV_PATHS: { [path: string]: string } = {
  "/": "Home",
  "/concierge": "Concierge",
  "/trip/active": "Viagem Ativa",
  "/trips/upcoming": "Próximas Viagens",
  "/trip/new": "Nova Viagem",
  "/community": "Comunidade",
};

function getBreadcrumbName(path: string) {
  if (path.startsWith("/discovery")) return "Descoberta Local";
  if (path.startsWith("/feedback")) return "Feedback de Local";
  if (path.startsWith("/trip/add-expense")) return "Adicionar Despesas";
  return NAV_PATHS[path] || "";
}

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const showBack =
    location.pathname !== "/" &&
    location.pathname !== "/home";

  return (
    <header className="w-full flex items-center justify-between py-4 px-4 md:px-8 bg-card shadow-soft rounded-b-lg">
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Menu"
          className="md:hidden p-2 rounded-md hover:bg-terracotta-light transition"
          onClick={() => navigate("/profile")}
        >
          <Menu className="text-terracotta" size={28} />
        </button>
        <Compass className="text-terracotta hidden md:block" size={32} />
        <span className="font-bold text-xl tracking-tight text-terracotta hidden md:block">
          Go Nomad
        </span>
      </div>
      <div className="flex-1 flex justify-center">
        {showBack && (
          <button
            className="flex items-center px-2 py-1 rounded-md text-terracotta hover:bg-terracotta-light font-medium transition"
            onClick={() => navigate(-1)}
          >
            ← Voltar
          </button>
        )}
        <span className="md:hidden font-bold text-lg text-terracotta">
          {getBreadcrumbName(location.pathname)}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <img
          src="https://randomuser.me/api/portraits/women/22.jpg"
          alt="Avatar"
          className="w-9 h-9 rounded-full border-2 border-terracotta cursor-pointer"
          onClick={() => navigate("/profile")}
        />
      </div>
    </header>
  );
};

export default Navbar;
