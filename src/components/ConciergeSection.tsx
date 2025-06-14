
import React from "react";
import ConciergeCard from "@/components/ConciergeCard";

export const ConciergeSection: React.FC = () => (
  <section>
    <h2 className="heading-sm font-semibold text-[#AD4F36] px-5 mb-3 text-base md:text-lg tracking-tight font-inter">
      Concierge IA
    </h2>
    <div className="px-4 mb-3">
      <ConciergeCard />
    </div>
  </section>
);
