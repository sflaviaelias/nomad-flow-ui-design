
import { Airplay, MapPinned, Users } from "lucide-react";

interface Props {
  step: 1 | 2 | 3;
}

export default function OnboardingIllustration({ step }: Props) {
  // Minimalista, alinhado ao Untitled UI, padding extra à esquerda
  const iconClasses = "mb-8 text-[#E76F51] bg-[#F9E1DA] rounded-lg p-4 shadow-soft";
  switch (step) {
    case 1:
      return <Airplay size={52} className={iconClasses} aria-label="Planejamento de viagem" />;
    case 2:
      return <MapPinned size={52} className={iconClasses} aria-label="Destino inteligente" />;
    case 3:
      return <Users size={52} className={iconClasses} aria-label="Conexão local" />;
    default:
      return null;
  }
}
