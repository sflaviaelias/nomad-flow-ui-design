
import { useNavigate } from "react-router-dom";

export default function OnboardingHeader() {
  const navigate = useNavigate();
  return (
    <div className="w-full flex justify-end items-center px-4 pt-5 md:pt-7 pb-3">
      <button
        className="text-sm font-medium text-[#E76F51] bg-transparent focus:outline-none focus:underline underline underline-offset-2 rounded px-3 py-1 transition hover:text-[#AD4F36] focus-visible:ring-2 ring-[#E76F51] min-w-[48px]"
        onClick={() => navigate("/")}
        aria-label="Pular onboarding"
        tabIndex={0}
      >
        Pular onboarding
      </button>
    </div>
  );
}
