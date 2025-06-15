
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

function isTodayWithin(start: string, end: string) {
  const today = new Date();
  const startDate = new Date(start);
  const endDate = new Date(end);
  today.setHours(0, 0, 0, 0);
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);
  return today >= startDate && today <= endDate;
}

export function useActiveTrip() {
  return useQuery({
    queryKey: ["active-trip"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) return null;
      const { data: trips, error } = await supabase
        .from("trips")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw new Error(error.message);
      if (!trips) return null;

      const activeTrip = trips.find(trip =>
        isTodayWithin(trip.start_date, trip.end_date)
      );
      return activeTrip || null;
    }
  });
}
