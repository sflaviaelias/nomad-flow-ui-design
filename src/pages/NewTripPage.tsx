import React from "react";
import PageHeader from "@/components/PageHeader";
import TripCreationWizard from "../components/TripCreationWizard";

const NewTripPage = () => (
  <div className="min-h-screen bg-[#FAF3EC] flex flex-col">
    {/* Exibe a tela mobile otimizada somente se for mobile, senão volta para o wizard antigo */}
    {/* O ideal seria usar um hook de verificação de mobile, mas para demo forçamos o uso da nova tela */}
    {/* Remova o comentário abaixo para alternar para o novo form */}
    {/* <NewTripMobileScreen /> */}
    <PageHeader title="Programar Nova Viagem" showBack />
    <main className="flex-1 w-full max-w-xl mx-auto pt-2 pb-6 px-2 md:px-0">
      <TripCreationWizard />
    </main>
  </div>
);

export default NewTripPage;
