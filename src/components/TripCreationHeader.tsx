
import React from "react";

const TripCreationHeader: React.FC = () => (
  <div className="flex flex-col gap-2">
    <span className="font-bold text-xl text-terracotta">Nova Viagem</span>
    <span className="text-neutral-700 text-sm">
      Preencha as etapas para planejar sua próxima jornada.
    </span>
  </div>
);

export default TripCreationHeader;
