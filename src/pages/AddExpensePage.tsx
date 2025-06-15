import React, { useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import { useNavigationHistory } from "@/contexts/NavigationHistoryContext";

// Exemplo de conteúdo mínimo para manter lógica de histórico (adicione componentes específicos conforme necessário)
export default function AddExpensePage() {
  const { push } = useNavigationHistory();

  useEffect(() => {
    push(window.location.pathname);
    // eslint-disable-next-line
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF3EC] pb-16">
      <PageHeader title="Adicionar Despesa" showBack />
      <main className="p-4 text-neutral-600 text-base">
        (Formulário de cadastro de despesa aqui...)
      </main>
    </div>
  );
}
