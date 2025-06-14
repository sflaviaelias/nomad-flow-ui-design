
import React from "react";
import Navbar from "../components/Navbar";
import PageHeader from "../components/PageHeader";

const ConciergePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <PageHeader title="Concierge IA" showBack />
        <div className="p-4 text-neutral-700">
          <div className="text-center text-lg font-medium">Em breve: área de interação com o Concierge IA.</div>
        </div>
      </main>
    </div>
  );
};

export default ConciergePage;
