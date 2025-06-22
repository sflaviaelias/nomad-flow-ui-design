
import React from "react";
import { Menu, Bell } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import AppMenuDrawer from "./AppMenuDrawer";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

type Props = {
  user: { name?: string; avatarUrl?: string };
};

export default function HomeHeader({ user }: Props) {
  const navigate = useNavigate();
  const { user: authUser } = useSupabaseAuth();

  const saudacao =
    user?.name === "Flávia"
      ? "Olá, Flávia"
      : user?.name
      ? `Olá, ${user.name}`
      : "Olá, Nômade!";

  const [drawerOpen, setDrawerOpen] = React.useState(false);

  return (
    <header className="bg-gradient-to-b from-[#FAF3EC] to-[#FAF3EC]/95 px-5 pt-12 pb-6 select-none">
      {/* Header principal - elementos no topo */}
      <div className="flex items-center justify-between mb-4">
        {/* Menu hambúrguer à esquerda */}
        <button
          type="button"
          aria-label="Abrir menu"
          className="flex items-center justify-center rounded-xl p-3 hover:bg-white/60 transition-all duration-200 shadow-sm border border-white/40"
          style={{ minWidth: 48, minHeight: 48 }}
          onClick={() => setDrawerOpen(true)}
        >
          <Menu size={22} className="text-[#6D4530]" strokeWidth={1.8} />
        </button>

        {/* Lado direito - Notificações e Avatar */}
        <div className="flex items-center gap-3">
          {/* Notificações */}
          <button
            type="button"
            aria-label="Notificações"
            className="flex items-center justify-center rounded-xl p-3 hover:bg-white/60 transition-all duration-200 shadow-sm border border-white/40 relative"
            style={{ minWidth: 48, minHeight: 48 }}
          >
            <Bell size={20} className="text-[#6D4530]" strokeWidth={1.8} />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#E76F51] rounded-full border-2 border-white"></div>
          </button>

          {/* Avatar com efeito sofisticado */}
          <button
            type="button"
            aria-label="Perfil"
            className="relative group"
            onClick={() => navigate("/profile")}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#E76F51] to-[#C9583C] rounded-2xl blur-sm opacity-60 group-hover:opacity-80 transition-all duration-300"></div>
            <div className="relative bg-white p-1 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
              <Avatar className="w-12 h-12 border-2 border-[#E76F51]/20">
                {user.avatarUrl ? (
                  <AvatarImage 
                    src={user.avatarUrl} 
                    alt={`Avatar de ${user.name ?? "Nômade"}`}
                    className="object-cover"
                    onError={(e) => {
                      console.error("Erro ao carregar avatar no header:", user.avatarUrl);
                    }}
                  />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-[#E76F51] to-[#C9583C] text-white font-bold text-lg">
                    {user.name?.[0]?.toUpperCase() ?? "N"}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>
          </button>
        </div>
      </div>

      {/* Saudação alinhada à direita */}
      <div className="flex justify-end">
        <h1 className="font-inter text-xl font-semibold text-[#6D4530] tracking-tight">
          {saudacao}
        </h1>
      </div>

      <AppMenuDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />

      {/* Versão para desktop - layout otimizado */}
      <div className="hidden lg:block">
        <div className="flex items-center justify-between mb-6">
          {/* Menu */}
          <button
            type="button"
            aria-label="Abrir menu"
            className="flex items-center justify-center rounded-2xl p-4 hover:bg-white/60 transition-all duration-200 shadow-md border border-white/50"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu size={24} className="text-[#6D4530]" strokeWidth={1.8} />
          </button>

          {/* Notificações e Avatar */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label="Notificações"
              className="flex items-center justify-center rounded-2xl p-4 hover:bg-white/60 transition-all duration-200 shadow-md border border-white/50 relative"
            >
              <Bell size={22} className="text-[#6D4530]" strokeWidth={1.8} />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#E76F51] rounded-full border-2 border-white"></div>
            </button>

            <button
              type="button"
              aria-label="Perfil"
              className="relative group"
              onClick={() => navigate("/profile")}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#E76F51] to-[#C9583C] rounded-3xl blur-md opacity-50 group-hover:opacity-70 transition-all duration-300"></div>
              <div className="relative bg-white p-1.5 rounded-3xl shadow-xl group-hover:shadow-2xl transition-all duration-300">
                <Avatar className="w-14 h-14 border-3 border-[#E76F51]/30">
                  {user.avatarUrl ? (
                    <AvatarImage 
                      src={user.avatarUrl} 
                      alt={`Avatar de ${user.name ?? "Nômade"}`}
                      className="object-cover"
                      onError={(e) => {
                        console.error("Erro ao carregar avatar no header desktop:", user.avatarUrl);
                      }}
                    />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-[#E76F51] to-[#C9583C] text-white font-bold text-xl">
                      {user.name?.[0]?.toUpperCase() ?? "N"}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>
            </button>
          </div>
        </div>

        {/* Saudação desktop alinhada à direita */}
        <div className="flex justify-end">
          <h1 className="font-inter text-2xl font-bold text-[#6D4530] tracking-tight">
            {saudacao}
          </h1>
        </div>
      </div>
    </header>
  );
}
