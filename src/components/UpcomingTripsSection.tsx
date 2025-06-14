
import React from "react";
import UpcomingTripsPreview from "@/components/UpcomingTripsPreview";

export const UpcomingTripsSection: React.FC = () => (
  <section>
    <h2 className="heading-sm font-semibold text-[#AD4F36] px-5 mb-3 text-base md:text-lg tracking-tight font-inter">
      Próximas viagens
    </h2>
    <div className="px-4">
      <UpcomingTripsPreview />
    </div>
  </section>
);
