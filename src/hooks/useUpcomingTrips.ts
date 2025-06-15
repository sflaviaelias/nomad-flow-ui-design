
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useUpcomingTrips() {
  return useQuery({
    queryKey: ["upcoming-trips"],
    queryFn: async () => {
      const authRes = await supabase.auth.getUser();
      const user = authRes.data.user;
      if (!user) return [];
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .eq("user_id", user.id)
        .gt("start_date", new Date().toISOString().slice(0, 10))
        .order("start_date", { ascending: true });
      if (error) throw new Error(error.message);
      return data || [];
    }
  });
}
