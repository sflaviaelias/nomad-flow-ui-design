
import React from "react";
import { useParams } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import PlaceBannerImage from "@/components/PlaceBannerImage";
import PlaceDetailsCard from "@/components/PlaceDetailsCard";
import PlaceReviewsSection from "@/components/PlaceReviewsSection";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

// Mocked data for demonstration
const MOCK_PLACE = {
  id: "1",
  name: "Café Nomad",
  image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80",
  rating: 4.8,
  distance: 1.3,
  address: "Rua das Andorinhas, 123, Vila Madalena, São Paulo - SP",
  openHours: "08:00 – 20:00",
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
  lat: -23.56168,
  lng: -46.67894,
};

const PlaceDetailsPage: React.FC = () => {
  const { placeId } = useParams<{ placeId: string }>();
  // In a real case, fetch by placeId. For now, always use MOCK_PLACE.

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF3EC]">
      <PageHeader title={MOCK_PLACE.name} showBack />
      <main className="flex-1 pb-32">
        <PlaceBannerImage image={MOCK_PLACE.image} />
        <section className="relative z-10 -mt-8 px-4">
          <PlaceDetailsCard
            rating={MOCK_PLACE.rating}
            distance={MOCK_PLACE.distance}
            address={MOCK_PLACE.address}
            openHours={MOCK_PLACE.openHours}
            tags={MOCK_PLACE.tags}
          />
        </section>
        {/* Map Preview */}
        <section className="px-4 mt-4">
          <div className="rounded-lg bg-white shadow-soft overflow-hidden">
            <div className="relative w-full h-44 bg-[#dadada] flex items-center justify-center">
              <span className="text-terra-800 flex items-center gap-2 font-medium">
                <MapPin className="text-terra-600" size={22} />
                Mapa
              </span>
              <button
                className="absolute right-3 bottom-3 text-xs rounded-md bg-[#faf3ec] font-semibold text-[#E76F51] px-3 py-1 shadow"
                // In a real app, this opens external maps
                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${MOCK_PLACE.lat},${MOCK_PLACE.lng}`, "_blank")}
              >
                Abrir no mapa
              </button>
              {/* This div mocks a map. Replace with interactive later */}
            </div>
            {/* Optionally, show small address under map */}
            <div className="text-xs text-neutral-500 px-4 py-2">{MOCK_PLACE.address}</div>
          </div>
        </section>
        {/* Reviews */}
        <section className="mt-6 px-4">
          <PlaceReviewsSection reviews={MOCK_PLACE.reviews} />
        </section>
      </main>
      {/* Fixed Footer */}
      <footer className="fixed inset-x-0 bottom-0 z-20 bg-[#FAF3EC] pb-safe px-4 pt-3 border-t border-[#E76F51]/10 flex flex-col items-stretch">
        <Button variant="default" className="w-full h-12 bg-[#E76F51] hover:bg-[#C9583C] text-white rounded-lg font-semibold text-base shadow-soft transition">
          Marcar como visitado
        </Button>
        {/* You could add a secondary CTA such as "Salvar nos favoritos" here */}
      </footer>
    </div>
  );
};

export default PlaceDetailsPage;

