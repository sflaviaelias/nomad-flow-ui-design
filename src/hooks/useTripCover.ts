import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "./useSupabaseAuth";
import { isCoverPhoto, type CoverResult } from "../../supabase/functions/trip-destination-cover/core";

export function useTripCover(tripId: string, destination: string) {
  const { user } = useSupabaseAuth();
  return useQuery<CoverResult>({
    queryKey: ["trip-cover", user?.id, tripId, destination],
    enabled: import.meta.env.VITE_TRIP_COVERS_ENABLED === "true" && !!user && !!tripId && !!destination,
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("trip-destination-cover", { body: { tripId } });
      if (error) throw new Error("Foto indisponível");
      if (data?.status === "ready" && isCoverPhoto(data.photo, destination)) return { status: "ready", photo: data.photo };
      return { status: data?.status === "pending" ? "pending" : "unavailable", photo: null };
    },
    staleTime: 5 * 60 * 1000, retry: false, refetchOnWindowFocus: false,
    refetchInterval: (query) => query.state.data?.status === "pending" ? 30_000 : false,
  });
}
