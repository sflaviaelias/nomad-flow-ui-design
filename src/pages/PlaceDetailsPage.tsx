
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Heart } from "lucide-react";
import { useDestinationImageUnsplash } from "@/hooks/useDestinationImageUnsplash";
import MapPreview from "@/components/MapPreview";

// Mock data for demo; in a real app, this would come via routing state or API.
const MOCK_PLACE = {
  id: "1",
  name: "Café Nomad",
  city: "São Paulo",
  country: "Brasil",
  neighborhood: "Vila Madalena",
  imageFallback: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80",
  rating: 4.8,
  distance: 1.3,
  address: "Rua das Andorinhas, 123, Vila Madalena, São Paulo - SP",
  openHours: "08:00 – 20:00",
  lat: -23.56168,
  lng: -46.67894,
  tags: ["Wi-Fi gratuito", "Bom para trabalhar", "Aceita cartão"],
  reviews: [
    {
      user: "Flávia L.",
      stars: 5,
      comment: "Ambiente ótimo para trabalhar e café delicioso!",
    },
    {
      user: "Rafael S.",
      stars: 4,
      comment: "Sinal de Wi-Fi excelente, recomendo.",
    },
    {
      user: "Letícia M.",
      stars: 5,
      comment: "Muito aconchegante, com tomadas e boa iluminação.",
    },
  ],
};

const PlaceDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { imageUrl, loading } = useDestinationImageUnsplash(
    `${MOCK_PLACE.name} ${MOCK_PLACE.city}`
  );

  // Animation for mounting/unmounting page
  React.useEffect(() => {
    document.body.classList.add("overflow-hidden");
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF3EC] flex flex-col animate-fade-in">
      {/* Header with back */}
      <PageHeader
        title={MOCK_PLACE.name}
        showBack
      />

      <main className="flex-1 pb-32 relative">
        {/* Banner image */}
        <div className="relative w-full">
          {loading ? (
            <div className="w-full aspect-[3/1.2] bg-[#dadada] animate-pulse rounded-b-2xl" />
          ) : (
            <img
              src={imageUrl || MOCK_PLACE.imageFallback}
              alt={MOCK_PLACE.name}
              className="object-cover w-full aspect-[3/1.2] rounded-b-2xl shadow-sm"
              style={{ minHeight: 190, maxHeight: 260 }}
              draggable={false}
            />
          )}
        </div>

        {/* Main info card */}
        <section className="relative z-10 -mt-8 px-4">
          <div className="bg-white rounded-xl shadow-soft p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star size={18} className="text-[#E76F51]" fill="#E76F51" strokeWidth={1.5} />
                <span className="text-base font-bold text-neutral-900">{MOCK_PLACE.rating?.toFixed(1)}</span>
              </div>
              <div className="text-xs text-neutral-600">
                {MOCK_PLACE.distance.toFixed(1)} km de você
              </div>
            </div>
            {/* Location details */}
            <div>
              <div className="text-[15px] text-neutral-800 font-semibold">{MOCK_PLACE.neighborhood}, {MOCK_PLACE.city}, {MOCK_PLACE.country}</div>
              <div className="text-xs text-neutral-500 mt-0.5">{MOCK_PLACE.address}</div>
              <div className="text-xs text-neutral-500 mt-1">Horário: {MOCK_PLACE.openHours}</div>
            </div>
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-1">
              {MOCK_PLACE.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-xs bg-[#F9E1DA] text-[#C2513B] rounded font-inter"
                >
                  {tag}
                </span>
              ))}
            </div>
            {/* Add to favorites */}
            <Button
              variant="outline"
              className="w-full mt-3 flex items-center gap-2 border-[#E76F51] text-[#E76F51] hover:bg-[#FAF3EC]"
              style={{ fontWeight: 600 }}
            >
              <Heart size={18} className="mr-1" />
              Adicionar aos favoritos
            </Button>
          </div>
        </section>

        {/* Map Preview */}
        <section className="px-4 mt-4">
          <div className="rounded-lg bg-white shadow-soft overflow-hidden">
            <div className="relative w-full h-44 bg-[#dadada] flex items-center justify-center">
              <MapPin className="text-terra-600 mr-2" size={22} />
              <span className="text-terra-800 font-medium">Mapa</span>
              <Button
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps/search/?api=1&query=${MOCK_PLACE.lat},${MOCK_PLACE.lng}`,
                    "_blank"
                  )
                }
                className="absolute right-3 bottom-3 text-xs rounded-md bg-[#E76F51] hover:bg-[#C9583C] text-white px-3 py-1 shadow"
                style={{ fontWeight: 600 }}
              >
                Obter direções
              </Button>
            </div>
            <div className="text-xs text-neutral-500 px-4 py-2">
              {MOCK_PLACE.neighborhood}, {MOCK_PLACE.city}, {MOCK_PLACE.country}
            </div>
          </div>
        </section>

        {/* Reviews */}
        <section className="mt-6 px-4">
          <div>
            <div className="font-bold text-[15px] mb-2 text-terra-700">Avaliações recentes</div>
            <div className="flex flex-col gap-3">
              {MOCK_PLACE.reviews.slice(0, 3).map((r, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg px-4 py-3 flex flex-col shadow-card border border-[#E76F51]/10"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-terra-900 text-sm">{r.user}</span>
                    <div className="flex items-center gap-1 ml-2">
                      <Star size={15} fill="#E76F51" className="text-terracotta" strokeWidth={1.3} />
                      <span className="text-xs font-bold text-neutral-700">{r.stars.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="text-xs text-neutral-600 mt-1">{r.comment}</div>
                </div>
              ))}
              {MOCK_PLACE.reviews.length === 0 && (
                <div className="text-xs text-neutral-500">Nenhuma avaliação ainda.</div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Fixed CTA Footer */}
      <footer className="fixed inset-x-0 bottom-0 z-20 bg-[#FAF3EC] pb-safe px-4 pt-3 border-t border-[#E76F51]/10 flex flex-col items-stretch">
        <Button
          variant="default"
          className="w-full h-12 bg-[#E76F51] hover:bg-[#C9583C] text-white rounded-lg font-semibold text-base shadow-soft transition"
          onClick={() => alert("Marcar como visitado (ação futura)")}
        >
          Marcar como visitado
        </Button>
      </footer>
    </div>
  );
};

export default PlaceDetailsPage;
