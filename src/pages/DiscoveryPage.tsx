
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import { useNavigationHistory } from "@/contexts/NavigationHistoryContext";
import { PLACES_MOCK, PlaceMock } from "@/components/placesMockData";
import { MapPin } from "lucide-react";

const getCategoryData = (category: string): { title: string, places: PlaceMock[] } => {
  if (category === "markets") {
    // Filtra apenas mercados e padarias (category market)
    const places = PLACES_MOCK.filter(
      (p) => p.category === "market"
    );
    return { title: "Mercados e Padarias", places };
  }
  // Em breve para outras categorias
  return { title: "Descoberta Local", places: [] };
};

const DiscoveryPage = () => {
  const { category } = useParams<{ category: string }>();
  const { push } = useNavigationHistory();
  const navigate = useNavigate();

  useEffect(() => {
    push(window.location.pathname);
    // eslint-disable-next-line
  }, []);

  const { title, places } = getCategoryData(category || "");

  return (
    <div className="min-h-screen bg-[#FAF3EC]">
      <PageHeader
        title={title}
        showBack
      />
      <main>
        <div className="p-4 max-w-lg mx-auto">
          {places.length > 0 ? (
            <div className="flex flex-col gap-4">
              {places.map((place) => (
                <button
                  key={place.id}
                  className="w-full text-left bg-white rounded-xl shadow-soft px-4 py-4 flex gap-3 items-start hover:shadow-md transition group focus-visible:ring-2 ring-[#E76F51] outline-none"
                  onClick={() => navigate(`/place/${place.id}`)}
                  aria-label={`Ver detalhes de ${place.name}`}
                >
                  <img
                    src={place.image}
                    alt={place.name}
                    className="w-16 h-16 rounded-md object-cover flex-shrink-0 border border-[#E76F5115] bg-[#dadada]/40"
                    style={{ minWidth: 64, minHeight: 64 }}
                  />
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-1">
                      <MapPin size={15} className="text-[#E76F51]" />
                      <span className="font-semibold text-[#E76F51] text-[15px] truncate">{place.name}</span>
                    </div>
                    <div className="text-xs text-neutral-500 truncate">{place.address}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-bold text-[#E76F51]">{place.rating.toFixed(1)}</span>
                      <span className="text-xs text-neutral-400">({place.reviewsCount} avaliações)</span>
                    </div>
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
