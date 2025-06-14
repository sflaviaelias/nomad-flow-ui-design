
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type TravelAIResult = {
  visa_required?: boolean | null;
  vaccines_required?: boolean | null;
  comment?: string;
  progress_comment?: string;
  remainingDays?: number | null;
  error?: string;
};

interface UseActiveTripAIOptions {
  destination: string;
  tripStart: string;
  tripEnd: string;
  budget: string;
  currency: string;
  spent: number;
}

export function useActiveTripAI(opts: UseActiveTripAIOptions) {
  const [data, setData] = useState<TravelAIResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchAI() {
      setLoading(true);
      // Get nationality from profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) {
        setData({ error: "Usuário não autenticado" });
        setLoading(false);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("country")
        .eq("id", user.id)
        .maybeSingle();

      // Fallback country
      const nationality = profile?.country || "Brasil";
      const res = await fetch("/functions/v1/active-trip-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nationality,
          ...opts,
        }),
      });
      const out = await res.json();
      setData(out);
      setLoading(false);
    }
    if (opts.destination && opts.tripStart && opts.tripEnd && opts.budget) {
      fetchAI();
    }
  }, [opts.destination, opts.tripStart, opts.tripEnd, opts.budget, opts.currency, opts.spent]);

  return { data, loading };
}
