
import React from "react";
import Navbar from "../components/Navbar";
import PageHeader from "../components/PageHeader";

const NewTripPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <PageHeader title="Nova Viagem" showBack />
        <div className="p-4 text-neutral-700">
          <div className="text-center text-lg font-medium">Tela para programar nova viagem.</div>
        </div>
      </main>
    </div>
  );
};

export default NewTripPage;
