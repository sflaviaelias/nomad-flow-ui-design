
import React from "react";
import PageHeader from "../components/PageHeader";

const ActiveTripDetailsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <PageHeader title="Detalhes da Viagem Ativa" showBack />
        <div className="p-4 text-neutral-700">
          <div className="text-center text-lg font-medium">Painel de detalhes da viagem (itinerário, checklist, clima, orçamento...)</div>
        </div>
      </main>
    </div>
  );
};

export default ActiveTripDetailsPage;
