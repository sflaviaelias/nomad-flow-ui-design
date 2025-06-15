
import { Button } from "@/components/ui/button";
import OnboardingHeader from "./OnboardingHeader";
import OnboardingIllustration from "./OnboardingIllustration";

interface Props {
  onNext: () => void;
}
export default function OnboardingScreen3({ onNext }: Props) {
  return (
    <div className="flex flex-col h-full items-center w-full max-w-sm mx-auto">
      <OnboardingHeader />
      <OnboardingIllustration step={3} />
      <div className="flex-1 flex flex-col justify-center items-center w-full px-4 text-center">
        <h1 className="font-bold text-3xl md:text-4xl leading-tight mb-3 text-[#E76F51] font-sans">
          Conecte-se ao que importa
        </h1>
        <p className="text-base md:text-lg text-[#6D4530] mb-8 font-sans font-normal leading-relaxed" style={{ maxWidth: 370 }}>
          Descubra coworkings, cafés, comunidades e dicas locais.<br />
          Tudo para viver como local, em qualquer lugar.
        </p>
        <Button
          className="w-full py-3 rounded-lg font-semibold text-lg shadow-soft transition-colors bg-[#E76F51] text-white hover:bg-terra-800 focus-visible:ring-2 focus-visible:ring-[#AD4F36] min-h-[48px]"
          onClick={onNext}
          tabIndex={0}
        >
          Criar sua conta
        </Button>
      </div>
    </div>
  );
}
