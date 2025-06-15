
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";

/**
 * Botão fixo para convidado fazer login/criar conta.
 */
export default function GuestLoginButton() {
  const navigate = useNavigate();
  return (
    <div className="fixed top-4 left-0 right-0 z-40 flex justify-center pointer-events-none">
      <Button
        onClick={() => navigate("/auth/access")}
        className="pointer-events-auto bg-[#E76F51] text-white font-bold shadow py-2 px-6 rounded-xl border-2 border-[#E76F51]"
        style={{
          fontFamily: "Inter",
          minWidth: 170,
        }}
      >
        <LogIn className="mr-2" size={18} />
        Entrar ou Criar Conta
      </Button>
    </div>
  );
}
