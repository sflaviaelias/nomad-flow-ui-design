import { useContext } from "react";
import { AuthContext } from "@/contexts/auth-context";
export function useSupabaseAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useSupabaseAuth requer AuthProvider.");
  return context;
}
