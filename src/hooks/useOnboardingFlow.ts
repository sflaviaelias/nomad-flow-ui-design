
import { useEffect, useState } from "react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

// Controle centralizado do onboarding. Retorna { show, checked, finishOnboarding }
export function useOnboardingFlow() {
  const { user, loading } = useSupabaseAuth();
  const [checked, setChecked] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (loading) return;
    const onboardingDone = localStorage.getItem("onboarding_done") === "1";
    if (!user && !onboardingDone) {
      setShow(true);
    } else {
      setShow(false);
    }
    setChecked(true);
  }, [user, loading]);

  const finishOnboarding = () => {
    localStorage.setItem("onboarding_done", "1");
    setShow(false);
  };

  return { show, checked, finishOnboarding };
}
