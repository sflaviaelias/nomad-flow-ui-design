import { useTrips } from "./useTrips";
import { activeTrip } from "@/lib/trips";
export function useActiveTrip() {
  const query = useTrips();
  return { ...query, data: activeTrip(query.data ?? []) };
}
