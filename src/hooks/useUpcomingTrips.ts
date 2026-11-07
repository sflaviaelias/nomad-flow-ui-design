import { useTrips } from "./useTrips";
import { localDateKey } from "@/lib/trips";
export function useUpcomingTrips() {
  const query = useTrips();
  return { ...query, data: query.data?.filter((trip) => trip.start_date > localDateKey())
    .sort((a, b) => a.start_date.localeCompare(b.start_date)) };
}
