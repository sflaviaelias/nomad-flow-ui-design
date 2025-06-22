
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
      if (!user?.id) {
        console.log("[useActiveTrip] No user found");
        return null;
      }

      console.log("[useActiveTrip] Fetching trips for user:", user.id);
      
      const { data: trips, error } = await supabase
        .from("trips")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }); // Ordenar por mais recente primeiro

      if (error) {
        console.error("[useActiveTrip] Error fetching trips:", error);
        throw new Error(error.message);
      }
      
      if (!trips || trips.length === 0) {
        console.log("[useActiveTrip] No trips found");
        return null;
      }

      console.log("[useActiveTrip] Found trips:", trips.length);

      // Procurar viagem ativa (data atual dentro do período da viagem)
      const activeTrip = trips.find(trip => {
        const isActive = isTodayWithin(trip.start_date, trip.end_date);
        console.log(`[useActiveTrip] Trip ${trip.destination}: ${trip.start_date} to ${trip.end_date}, active: ${isActive}`);
        return isActive;
      });

      if (activeTrip) {
        console.log("[useActiveTrip] Active trip found:", activeTrip.destination);
        return activeTrip;
      }

      console.log("[useActiveTrip] No active trip found");
      return null;
    }
  });
}
