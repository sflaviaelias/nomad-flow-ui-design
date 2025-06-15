
import { Button } from "@/components/ui/button";
import OnboardingHeader from "./OnboardingHeader";
import OnboardingIllustration from "./OnboardingIllustration";

interface Props {
  onNext: () => void;
}
export default function OnboardingScreen3({ onNext }: Props) {
  return (
    <div className="flex flex-col min-h-screen items-stretch w-full max-w-md mx-auto bg-[#FAF3EC] px-0">
      <OnboardingHeader />
      <div className="flex flex-col flex-1 w-full px-6 pt-2 pb-4">
        <OnboardingIllustration step={3} />
        <h1 className="font-bold text-3xl md:text-4xl leading-snug mb-4 text-[#E76F51] font-sans text-left">
          Conecte-se ao que importa
        </h1>
        <p className="text-base md:text-lg text-[#8C5B3E] mb-10 font-sans font-normal leading-relaxed text-left max-w-xl">
          Descubra coworkings, cafés, comunidades e dicas locais.<br />
          Tudo para viver como local, em qualquer lugar.
        </p>
        <div className="mt-auto">
          <Button
            className="w-full py-3 rounded-lg font-semibold text-lg shadow-soft transition-colors bg-[#E76F51] text-white hover:bg-terra-800 focus-visible:ring-2 focus-visible:ring-[#AD4F36] min-h-[48px]"
            onClick={onNext}
            tabIndex={0}
          >
            Criar sua conta
          </Button>
        </div>
      </div>
    </div>
  );
}
