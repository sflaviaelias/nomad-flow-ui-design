
import { useEffect, useState } from "react";

type RankingResult = {
  placeId: string;
  compatibilityScore: number; // 0-1 (quanto maior, mais compatível)
  isRecommended: boolean;
  needsTranslation: boolean;
};

export function useDiscoveryRanking(category: string, places: any[], userProfile: any, userLanguage: string) {
  const [rankedPlaces, setRankedPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulação: Ranqueia de forma mockada, mas pronto para Groq
    async function fetchRanking() {
      setLoading(true);

      try {
        // Futuramente, enviar para um Edge Function:
        // const { data } = await supabase.functions.invoke("discovery-ranking", { body: {category, places, userProfile, userLanguage} });

        // Mock: maiores ratings primeiro, destaca se acima de 4.5 e compatibilidade randômica
        const scored = [...places]
          .map((place) => {
            const compatibilityScore = (Math.random() * 0.3) + 0.7; // Simule compatibilidade alta
            return {
              ...place,
              compatibilityScore,
              isRecommended: place.rating >= 4.5 && compatibilityScore > 0.8,
              needsTranslation: place.language && place.language !== userLanguage
            };
          })
          .sort((a, b) => (b.isRecommended ? 1 : 0) + b.rating - (a.isRecommended ? 1 : 0) - a.rating);

        setRankedPlaces(scored);
      } catch (error) {
        setRankedPlaces(places || []);
      }
      setLoading(false);
    }

    if (places && places.length) {
      fetchRanking();
    }
  }, [category, places, userProfile, userLanguage]);

  return { rankedPlaces, loading };
}
