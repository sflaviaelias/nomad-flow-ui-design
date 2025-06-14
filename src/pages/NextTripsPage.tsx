
import React from "react";
import Navbar from "../components/Navbar";
import PageHeader from "../components/PageHeader";

const NextTripsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <PageHeader title="Próximas Viagens" showBack />
        <div className="p-4 text-neutral-700">
          <div className="text-center text-lg font-medium">Aqui serão listadas as próximas viagens.</div>
        </div>
      </main>
    </div>
  );
};

export default NextTripsPage;
