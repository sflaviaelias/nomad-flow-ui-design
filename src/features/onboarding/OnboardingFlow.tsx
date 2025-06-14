
import { useState } from "react";
import OnboardingScreen1 from "./OnboardingScreen1";
import OnboardingScreen2 from "./OnboardingScreen2";
import OnboardingScreen3 from "./OnboardingScreen3";
import { useNavigate } from "react-router-dom";

export default function OnboardingFlow() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  return (
    <div className="h-screen w-screen bg-[#FAF3EC] flex flex-col justify-center items-center">
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-center">
        {step === 1 && <OnboardingScreen1 onNext={() => setStep(2)} />}
        {step === 2 && <OnboardingScreen2 onNext={() => setStep(3)} />}
        {step === 3 && <OnboardingScreen3 onNext={() => navigate('/auth/access')} />}
      </div>
      <div className="flex flex-row space-x-1 items-center justify-center mt-3 mb-6">
        {[1, 2, 3].map(n => (
          <span
            key={n}
            className={`h-2 w-2 rounded-full transition-all ${
              n === step ? "bg-[#E76F51]" : "bg-[#DADADA]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
