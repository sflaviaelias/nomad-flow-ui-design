
import React from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

export function AccountActionsCard() {
  const { signOut } = useSupabaseAuth();
  const navigate = useNavigate();

  return (
    <Card className="bg-white rounded-xl shadow-soft border-none mt-3">
      <CardContent className="flex flex-col gap-3 p-4">
        <Button
          variant="secondary"
          className="w-full text-terra-600 border-terra-600 bg-[#FAF3EC] hover:bg-terra-600/10 font-semibold text-base min-h-[44px]"
          style={{ fontFamily: "Inter" }}
          onClick={async () => {
            await signOut();
            toast({ title: "Sessão encerrada", description: "Você saiu da conta com sucesso." });
            navigate("/auth/access");
          }}
        >
          <LogOut className="mr-2" size={18} /> Sair da Conta
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full text-terra-700 bg-transparent hover:underline font-semibold text-base min-h-[44px] hover:bg-terra-600/5"
          style={{ fontFamily: "Inter" }}
          onClick={() => toast({ title: "Função indisponível no momento" })}
        >
          Excluir Conta
        </Button>
      </CardContent>
    </Card>
  );
}
