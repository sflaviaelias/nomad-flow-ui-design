
import { Button } from "@/components/ui/button";

interface Props {
  onNext: () => void;
}
export default function OnboardingScreen1({ onNext }: Props) {
  return (
    <div className="flex flex-col h-full items-center justify-center px-6 text-center animate-fade-in">
      <h1 className="font-bold text-2xl md:text-3xl mb-2 text-terra-600" style={{fontFamily: "Inter"}}>
        Mais que um app de viagem — um companheiro inteligente para sua vida nômade.
      </h1>
      <p className="text-base md:text-lg text-terra-900 mb-8" style={{fontFamily: "Inter"}}>
        Planeje, viva e trabalhe de onde quiser, com confiança.
      </p>
      <Button
        className="w-full py-3 bg-[#E76F51] text-white rounded-lg font-semibold text-lg shadow-md hover:bg-[#CC5A3D] transition-colors"
        onClick={onNext}
        style={{fontFamily: "Inter"}}
      >
        Começar
      </Button>
    </div>
  );
}
