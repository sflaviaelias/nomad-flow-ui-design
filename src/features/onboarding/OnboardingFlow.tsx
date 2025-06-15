
import { useState } from "react";
import OnboardingScreen1 from "./OnboardingScreen1";
import OnboardingScreen2 from "./OnboardingScreen2";
import OnboardingScreen3 from "./OnboardingScreen3";
import { useNavigate } from "react-router-dom";

export default function OnboardingFlow() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  // Aumenta contraste e acessibilidade dos indicadores
  return (
    <div className="min-h-screen w-full bg-[#FAF3EC] flex flex-col justify-center items-center font-sans">
      <div className="w-full flex-1 flex flex-col justify-center items-center">
        {step === 1 && <OnboardingScreen1 onNext={() => setStep(2)} />}
        {step === 2 && <OnboardingScreen2 onNext={() => setStep(3)} />}
        {step === 3 && <OnboardingScreen3 onNext={() => navigate('/auth/access')} />}
        <nav
          className="flex flex-row space-x-2 items-center justify-center mt-7 mb-3"
          aria-label="Progresso do onboarding"
        >
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              aria-label={`Etapa ${n}`}
              aria-current={n === step}
              tabIndex={0}
              className={`h-3 w-3 rounded-full border-[2.5px] focus:outline-none ring-2 ring-transparent focus-visible:ring-[#E76F51] transition
                ${n === step
                  ? "bg-[#E76F51] border-[#C9583C] scale-120 shadow-lg"
                  : "bg-[#F9E1DA] border-[#E76F51] opacity-80"
                }`}
              onClick={() => setStep(n)}
            />
          ))}
        </nav>
      </div>
    </div>
  );
}
