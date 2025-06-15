import React from "react";
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import { useNavigationHistory } from "@/contexts/NavigationHistoryContext";
import { PLACES_MOCK, PlaceMock } from "@/components/placesMockData";
import { MapPin } from "lucide-react";
import { useDiscoveryRanking } from "@/hooks/useDiscoveryRanking";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import DiscoveryPlaceCardSkeleton from "@/components/DiscoveryPlaceCardSkeleton";

const getCategoryData = (category: string): { title: string, places: PlaceMock[] } => {
  if (category === "markets") {
    const places = PLACES_MOCK.filter(
      (p) => p.category === "market"
    );
    return { title: "Mercados e Padarias", places };
  }
  if (category === "cafes") {
    const places = PLACES_MOCK.filter(
      (p) => p.category === "cafe"
    );
    return { title: "Cafés e Restaurantes", places };
  }
  if (category === "coworkings") {
    const places = PLACES_MOCK.filter(
      (p) => p.category === "coworking"
    );
    return { title: "Co-workings por perto", places };
  }
  return { title: "Descoberta Local", places: [] };
};

const DiscoveryPage = () => {
  const { category } = useParams<{ category: string }>();
  const { push } = useNavigationHistory();
  const navigate = useNavigate();
  const { user } = useSupabaseAuth();

  useEffect(() => {
    push(window.location.pathname);
    // eslint-disable-next-line
  }, []);

  // Simula idioma do usuário - usar do perfil real se possível
  const userLanguage = user?.user_metadata?.language || "pt";

  const { title, places } = getCategoryData(category || "");

  // IA rankeando
  const { rankedPlaces, loading } = useDiscoveryRanking(category || "", places, user, userLanguage);

  // Remove redundância de categoria no nome
  function cleanName(placeName: string) {
    const lower = placeName.toLowerCase();
    if (category === "markets" && lower.includes("mercado")) return placeName.replace(/mercado(s)?/gi, "").trim();
    if (category === "cafes" && lower.includes("café")) return placeName.replace(/café(s)?/gi, "").trim();
    if (category === "coworkings" && lower.includes("coworking")) return placeName.replace(/coworking(s)?/gi, "").trim();
    return placeName.trim();
  }

  return (
    <div className="min-h-screen bg-[#FAF3EC]">
      <PageHeader
        title={title}
        showBack
      />
      <main>
        <div className="p-4 max-w-lg mx-auto">
          {loading ? (
            <div className="flex flex-col gap-4 py-4">
              {[...Array(4)].map((_, i) => (
                <DiscoveryPlaceCardSkeleton key={i} />
              ))}
            </div>
          ) : rankedPlaces.length > 0 ? (
            <div className="flex flex-col gap-4">
              {rankedPlaces.map((place) => (
                <button
                  key={place.id}
                  className={`w-full text-left bg-white rounded-xl shadow-soft px-4 py-4 flex gap-3 items-start hover:shadow-md transition group focus-visible:ring-2 ring-[#E76F51] outline-none
                    ${place.isRecommended ? "border-2 border-[#E76F51]" : "border border-[#E76F51]/10"}
                  `}
                  onClick={() => navigate(`/place/${place.id}`)}
                  aria-label={`Ver detalhes de ${cleanName(place.name)}`}
                >
                  <img
                    src={place.image}
                    alt={cleanName(place.name)}
                    className="w-16 h-16 rounded-md object-cover flex-shrink-0 border border-[#E76F5115] bg-[#dadada]/40"
                    style={{ minWidth: 64, minHeight: 64 }}
                  />
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-1">
                      {place.isRecommended && (
                        <span className="inline-block mr-1 px-1.5 py-0.5 rounded text-xs bg-[#E76F51] text-white font-inter font-bold">
                          Top Recomendado
                        </span>
                      )}
                      {/* Remove categoria redundante */}
                      <span className="font-semibold text-[#E76F51] text-[15px] truncate">{cleanName(place.name)}</span>
                    </div>
                    <div className="text-xs text-neutral-500 truncate">{place.address}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-bold text-[#E76F51]">{place.rating?.toFixed(1)}</span>
                      <span className="text-xs text-neutral-400">
                        ({place.reviewsCount} avaliações)
                      </span>
                    </div>
                    {place.needsTranslation && (
                      <button
                        className="mt-1 text-xs text-[#AD4F36] underline underline-offset-2 font-medium"
                        tabIndex={-1}
                        onClick={e => { e.stopPropagation(); alert("Conteúdo traduzido para o seu idioma!"); }}
                        aria-label="Traduzir conteúdo"
                      >
                        Traduzir conteúdo
                      </button>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center text-lg font-medium text-neutral-600 mt-10">
              Em breve: lista de locais para {category}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DiscoveryPage;
