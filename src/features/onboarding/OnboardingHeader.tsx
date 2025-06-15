
import { useNavigate } from "react-router-dom";

export default function OnboardingHeader() {
  const navigate = useNavigate();
  return (
    <div className="w-full flex justify-end px-0 pt-6 pb-2 pr-6">
      <button
        className="text-sm font-medium text-[#C9583C] bg-transparent focus:outline-none focus:underline underline underline-offset-2 rounded px-3 py-1 transition hover:text-[#AD4F36] focus-visible:ring-2 ring-[#E76F51]"
        onClick={() => navigate("/")}
        aria-label="Pular onboarding"
        tabIndex={0}
      >
        Pular onboarding
      </button>
    </div>
  );
}
