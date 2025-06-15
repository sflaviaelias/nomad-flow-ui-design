import React from "react";
import { Menu, User } from "lucide-react"; // Lucide ícones do Untitled UI
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import AppMenuDrawer from "./AppMenuDrawer";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

// Novo Header conforme guidelines e DS
type Props = {
  user: { name?: string; avatarUrl?: string };
};

export default function HomeHeader({ user }: Props) {
  const navigate = useNavigate();
  const { user: authUser } = useSupabaseAuth();

  // Saudação conforme dado do user
  const saudacao =
    user?.name === "Flávia"
      ? "Olá, Flávia"
      : user?.name
      ? `Olá, ${user.name}`
      : "Olá, Nômade!";

  const [drawerOpen, setDrawerOpen] = React.useState(false);

  return (
    <header className="flex items-center justify-between px-3 pt-4 pb-2 bg-[#FAF3EC] select-none">
      {/* Menu Hambúrguer */}
      <button
        type="button"
        aria-label="Abrir menu"
        className="flex items-center justify-center rounded-md p-2 hover:bg-[#E76F5112] transition"
        style={{ minWidth: 44, minHeight: 44 }}
        onClick={() => setDrawerOpen(true)}
      >
        <Menu size={28} className="text-[#E76F51]" />
      </button>

      <AppMenuDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />

      {/* Saudação dinâmica */}
      <span className="flex-1 text-center font-inter text-lg md:text-xl font-semibold text-[#C9583C] select-none">
        {saudacao}
      </span>

      {/* Avatar do usuário (Untitled UI) */}
      <button
        type="button"
        aria-label="Perfil"
        className="ml-2"
        onClick={() => navigate("/profile")}
        style={{ minWidth: 44, minHeight: 44 }}
      >
        <Avatar className="w-11 h-11 ring-2 ring-[#E76F51] shadow-md">
          {user.avatarUrl ? (
            <AvatarImage src={user.avatarUrl} alt={`Avatar de ${user.name ?? "Nômade"}`} />
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
    </header>
  );
}
