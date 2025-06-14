
import React from "react";
import Navbar from "../components/Navbar";
import PageHeader from "../components/PageHeader";

const AddExpensePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <PageHeader title="Adicionar Despesas" showBack />
        <div className="p-4 text-neutral-700">
          <div className="text-center text-lg font-medium">Tela de adicionar despesas à viagem.</div>
        </div>
      </main>
    </div>
  );
};

export default AddExpensePage;
