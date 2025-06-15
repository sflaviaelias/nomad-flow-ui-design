
import React from "react";
import TravelProfileCheckboxes from "../TravelProfileCheckboxes";

interface Props {
  travelProfiles: string[];
  setTravelProfiles: (v: string[]) => void;
  error: boolean;
}

export function ProfileTravelProfileForm({
  travelProfiles,
  setTravelProfiles,
  error
}: Props) {
  return (
    <section>
      <label className="text-terra-900 font-medium text-sm mb-0.5 font-inter">
        Perfil de Viagem<span className="ml-0.5 text-red-500">*</span>
      </label>
      <TravelProfileCheckboxes
        value={travelProfiles}
        onChange={setTravelProfiles}
        error={error}
      />
      {/* Erro: só exibe se não houver seleção */}
      {error && (
        <span className="text-red-500 text-xs">Selecione ao menos um perfil</span>
      )}
    </section>
  );
}
