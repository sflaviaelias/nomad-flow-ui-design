
import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerClose,
  DrawerOverlay,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User, Settings, LogOut, Moon, Sun, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

const MENU_ITEMS = [
  {
    label: "Meu Perfil",
    icon: <User className="text-[#E76F51]" />,
    action: "profile",
  },
  {
    label: "Configurações",
    icon: <Settings className="text-[#E76F51]" />,
    action: "settings",
  },
  {
    // Este item será tratado separadamente, só mantido para o mapeamento
    label: "Tema",
    icon: null,
    action: "theme",
  },
  {
    label: "Termos e Políticas",
    icon: <FileText className="text-[#E76F51]" />,
    action: "policies",
  },
];

export type AppMenuDrawerProps = {
  open: boolean;
  onOpenChange: (val: boolean) => void;
};

export default function AppMenuDrawer({ open, onOpenChange }: AppMenuDrawerProps) {
  const navigate = useNavigate();
  const { user, signOut } = useSupabaseAuth();
  const [theme, setTheme] = React.useState<"light" | "dark">(
    (localStorage.getItem("theme") as "light" | "dark") || "light"
  );

  function handleThemeToggle() {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  }

  function handleMenuItem(action: string) {
    onOpenChange(false);
    switch (action) {
      case "profile":
        navigate("/profile");
        break;
      case "settings":
        navigate("/settings");
        break;
      case "policies":
        navigate("/policies");
        break;
      default:
        break;
    }
  }

  function handleLogout() {
    signOut?.();
    onOpenChange(false);
    navigate("/");
  }

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // Responsivo ‒ largura máxima 400px
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-w-[400px] w-full mx-auto rounded-t-2xl shadow-lg font-inter text-[#3E2C23] px-0 bg-[#FCF7F4]">
        <DrawerHeader className="p-4 pb-1 flex flex-col gap-1">
          {user ? (
            <div className="flex items-center gap-3 pb-1">
              <Avatar className="w-12 h-12 ring-2 ring-[#E76F51] shadow">
                {user.user_metadata?.avatar_url ? (
                  <AvatarImage src={user.user_metadata.avatar_url} alt={user.user_metadata.name || "Avatar"} />
                ) : (
                  <AvatarFallback className="bg-[#E76F51] text-white font-bold">
                    {user.user_metadata?.name?.[0] || "?"}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <div className="font-bold text-base text-[#C9583C]">{user.user_metadata?.name || user.email}</div>
                <div className="text-xs text-neutral-500 truncate">{user.email}</div>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full border-[#E76F51] text-[#E76F51] my-2 font-medium rounded-md py-2"
              onClick={() => {
                onOpenChange(false);
                navigate("/auth/access");
              }}
            >
              <User className="mr-2" />
              Entrar / Criar conta
            </Button>
          )}
        </DrawerHeader>
        <nav>
          <ul className="flex flex-col gap-2 px-3">
            {MENU_ITEMS.map((item) =>
              item.action === "theme" ? (
                <li
                  key={item.action}
                  className="rounded-lg bg-white px-4 py-3 shadow-card flex items-center justify-between cursor-pointer mb-2 hover:bg-[#E76F5112] transition"
                  onClick={handleThemeToggle}
                  aria-label={`Alternar tema: ${theme === "dark" ? "Escuro ⭢ Claro" : "Claro ⭢ Escuro"}`}
                >
                  <div className="flex items-center gap-2">
                    {theme === "dark" ? <Moon className="text-[#E76F51]" /> : <Sun className="text-[#E76F51]" />}
                    <span className="text-sm font-medium">
                      Tema:{" "}
                      {theme === "dark" ? "Escuro ⭢ Claro" : "Claro ⭢ Escuro"}
                    </span>
                  </div>
                </li>
              ) : (
                <li
                  key={item.action}
                  className="rounded-lg bg-white px-4 py-3 shadow-card flex items-center gap-3 cursor-pointer hover:bg-[#E76F5112] transition"
                  onClick={() => handleMenuItem(item.action)}
                >
                  {item.icon}
                  <span className="text-sm font-medium">{item.label}</span>
                </li>
              )
            )}
          </ul>
        </nav>
        <DrawerFooter>
          {user && (
            <Button
              variant="outline"
              className="w-full border-[#E76F51] text-[#E76F51] mt-1 font-semibold rounded-md py-2 mb-1 flex items-center justify-center gap-2"
              onClick={handleLogout}
            >
              <LogOut className="mr-1" />
              Sair da Conta
            </Button>
          )}
        </DrawerFooter>
        <DrawerClose />
      </DrawerContent>
      <DrawerOverlay />
    </Drawer>
  );
}

