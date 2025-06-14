
import React from "react";
import { useParams } from "react-router-dom";
import PageHeader from "@/components/PageHeader";

const DiscoveryPage = () => {
  const { category } = useParams<{ category: string }>();
  return (
    <div className="min-h-screen bg-[#FAF3EC]">
      <PageHeader
        title={
          category === "markets"
            ? "Mercados e Padarias"
            : category === "cafes"
            ? "Restaurantes e Cafés"
            : category === "coworkings"
            ? "Coworkings Locais"
            : "Descoberta Local"
        }
        showBack
      />
      <main>
        <div className="p-4 text-neutral-700">
          <div className="text-center text-lg font-medium">
            Em breve: lista de locais para {category}.
          </div>
        </div>
      </main>
    </div>
  );
};

export default DiscoveryPage;
