
import React from "react";
import PageHeader from "@/components/PageHeader";

const AddExpensePage = () => {
  return (
    <div className="min-h-screen bg-[#FAF3EC]">
      <PageHeader title="Adicionar Despesas" showBack />
      <main>
        <div className="p-4 text-neutral-700">
          <div className="text-center text-lg font-medium">Tela de adicionar despesas à viagem.</div>
        </div>
      </main>
    </div>
  );
};

export default AddExpensePage;
