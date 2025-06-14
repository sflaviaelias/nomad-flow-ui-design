
import React from "react";
import PageHeader from "@/components/PageHeader";

const NextTripsPage = () => {
  return (
    <div className="min-h-screen bg-[#FAF3EC]">
      <PageHeader title="Próximas Viagens" showBack />
      <main>
        <div className="p-4 text-neutral-700">
          <div className="text-center text-lg font-medium">Aqui serão listadas as próximas viagens.</div>
        </div>
      </main>
    </div>
  );
};

export default NextTripsPage;
