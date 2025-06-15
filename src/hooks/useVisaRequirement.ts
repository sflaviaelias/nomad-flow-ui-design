
import { useState, useEffect } from "react";

/**
 * Mock de requisição de visto:
 * Exige visto se origem Brasil e destino USA, Austrália, Japão, Canadá, Índia, China.
 */
const VISA_REQUIRED = ["Estados Unidos", "Austrália", "Japão", "Canadá", "Índia", "China"];

export function useVisaRequirement(nationality: string, destinationCountry: string) {
  const [required, setRequired] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!nationality || !destinationCountry) {
      setRequired(null);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      // Mock: brasileiro precisa de visto só se for para os países acima
      if (nationality === "BR" && VISA_REQUIRED.includes(destinationCountry)) setRequired(true);
      else setRequired(false);
      setLoading(false);
    }, 600);
  }, [nationality, destinationCountry]);

  return { required, loading };
}
