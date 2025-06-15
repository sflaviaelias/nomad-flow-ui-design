
import React from "react";
import DiscoverySection from "@/components/DiscoverySection";

// Mantém o TÍTULO PRINCIPAL "Descoberta" aqui, conforme o padrão de seção
export const DiscoverySectionWrapper: React.FC = () => (
  <section>
    <h2 className="heading-sm font-semibold text-[#AD4F36] px-5 mb-3 text-base md:text-lg tracking-tight font-inter">
      Descoberta
    </h2>
    <div className="px-4">
      <DiscoverySection />
    </div>
  </section>
);
