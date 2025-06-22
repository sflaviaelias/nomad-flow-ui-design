
import React from "react";
import { Menu, User } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import AppMenuDrawer from "./AppMenuDrawer";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import LogoMini from "./LogoMini";

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
    <header className="bg-[#FAF3EC] px-4 pt-6 pb-4 select-none">
      {/* Primeira linha: Logo centralizada */}
      <div className="flex justify-center mb-4">
        <LogoMini size="medium" showText={true} />
      </div>

      {/* Segunda linha: Menu, Saudação e Avatar */}
      <div className="flex items-center justify-between">
        {/* Menu hambúrguer à esquerda */}
        <button
          type="button"
          aria-label="Abrir menu"
          className="flex items-center justify-center rounded-lg p-2 hover:bg-[#E76F5112] transition-colors"
          style={{ minWidth: 44, minHeight: 44 }}
          onClick={() => setDrawerOpen(true)}
        >
          <Menu size={20} className="text-[#E76F51]" />
        </button>

        <AppMenuDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />

        {/* Saudação centralizada */}
        <div className="flex-1 text-center px-4">
          <span className="font-inter text-lg md:text-xl font-semibold text-[#C9583C] select-none">
            {saudacao}
          </span>
        </div>

        {/* Avatar do usuário à direita */}
        <button
          type="button"
          aria-label="Perfil"
          className="flex items-center justify-center rounded-lg p-1"
          onClick={() => navigate("/profile")}
          style={{ minWidth: 44, minHeight: 44 }}
        >
          <Avatar className="w-10 h-10 ring-2 ring-[#E76F51] shadow-sm">
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
              <AvatarFallback
                className="bg-[#E76F51] text-white font-medium text-sm"
                aria-label="Avatar"
              >
                <User size={20} />
              </AvatarFallback>
            )}
          </Avatar>
        </button>
      </div>

      {/* Versão para desktop (opcional) - usando breakpoints do Tailwind */}
      <div className="hidden lg:block">
        <div className="flex items-center justify-between pt-2">
          {/* Logo maior à esquerda no desktop */}
          <div className="flex items-center gap-4">
            <LogoMini size="large" showText={true} />
          </div>

          {/* Saudação centralizada */}
          <div className="flex-1 text-center">
            <span className="font-inter text-2xl font-semibold text-[#C9583C]">
              {saudacao}
            </span>
          </div>

          {/* Ações à direita */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Abrir menu"
              className="flex items-center justify-center rounded-lg p-3 hover:bg-[#E76F5112] transition-colors"
              onClick={() => setDrawerOpen(true)}
            >
              <Menu size={24} className="text-[#E76F51]" />
            </button>

            <button
              type="button"
              aria-label="Perfil"
              className="flex items-center justify-center rounded-lg p-1"
              onClick={() => navigate("/profile")}
            >
              <Avatar className="w-12 h-12 ring-2 ring-[#E76F51] shadow-md">
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
                  <AvatarFallback
                    className="bg-[#E76F51] text-white font-bold"
                    aria-label="Avatar"
                  >
                    <User size={24} />
                  </AvatarFallback>
                )}
              </Avatar>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
