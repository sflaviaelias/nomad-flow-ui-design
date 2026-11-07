import { useQuery } from "@tanstack/react-query";
import { useSupabaseAuth } from "./useSupabaseAuth";
import { getTrip, listTrips } from "@/lib/trips";
export function useTrips() {
  const { user, loading } = useSupabaseAuth();
  return useQuery({ queryKey: ["trips", user?.id], enabled: !loading && !!user,
    queryFn: ({ signal }) => listTrips(user.id, signal) });
}
export function useTrip(id?: string) {
  const { user, loading } = useSupabaseAuth();
  return useQuery({ queryKey: ["trips", user?.id, id], enabled: !loading && !!user && !!id,
    queryFn: ({ signal }) => getTrip(user.id, id, signal) });
}
