
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, MapPin, ArrowLeft, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Map to select image placeholder depending on category
const categoryImage: Record<string, string> = {
  cafe: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
  coworking: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80",
  market: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80",
  news: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=800&q=80",
};

const LAT = -23.56168;
const LNG = -46.67894;

const MOCK = {
  name: "Café Nômade",
  category: "cafe",
  address: "Rua das Andorinhas, 123, Vila Madalena, São Paulo - SP",
  rating: 4.7,
  reviewsCount: 21,
  image: "",
  businessHours: [
    ["Segunda-feira", "08:00 – 20:00"],
    ["Terça-feira", "08:00 – 20:00"],
    ["Quarta-feira", "08:00 – 20:00"],
    ["Quinta-feira", "08:00 – 21:00"],
    ["Sexta-feira", "08:00 – 21:00"],
    ["Sábado", "09:00 – 18:00"],
    ["Domingo", "Fechado"],
  ],
  reviews: [
    {
      name: "Flávia L.",
      rating: 5,
      comment: "Ambiente acolhedor e ótimo café. Voltarei mais vezes!",
      timestamp: "há 2 dias",
    },
    {
      name: "Rafael S.",
      rating: 4,
      comment: "Wi-fi rápido e boas opções de lanches.",
      timestamp: "há 1 semana",
    },
    {
      name: "Letícia M.",
      rating: 5,
      comment: "Perfeito para trabalhar, tomadas em todas as mesas.",
      timestamp: "há 1 mês",
    },
  ],
};

const PlaceDetailsPage: React.FC = () => {
  const { placeId } = useParams();
  const navigate = useNavigate();

  const category =
    MOCK.category ||
    "cafe"; // could use placeId to select category for the mock

  const image =
    categoryImage[category] ||
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80";

  return (
    <div className="min-h-screen bg-[#FAF3EC] flex flex-col">
      {/* Header */}
      <header className="w-full flex items-center justify-between px-4 pt-4 pb-2 bg-[#FAF3EC] shadow-soft rounded-b-lg select-none">
        <button
          className="flex items-center justify-center rounded-full hover:bg-[#E76F511A] transition"
          style={{
            width: 44, height: 44, minWidth: 44, minHeight: 44,
          }}
          aria-label="Voltar"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={24} className="text-[#E76F51]" />
        </button>
        <h1 className="flex-1 text-center font-inter font-semibold text-lg md:text-xl" style={{ color: "#E76F51" }}>
          {MOCK.name}
        </h1>
        <span style={{ width: 44, height: 44, minWidth: 44, minHeight: 44 }}></span>
      </header>

      {/* Main */}
      <main className="flex-1 relative pb-32 pt-0">
        {/* Banner Image */}
        <div className="w-full aspect-[3/1.3] relative bg-[#dadada]/60">
          <img
            src={image}
            alt={MOCK.category}
            className="object-cover w-full h-full rounded-b-2xl shadow-md"
            style={{ minHeight: 170, maxHeight: 240 }}
            draggable={false}
          />
        </div>

        {/* Details Card */}
        <section className="-mt-8 px-4">
          <Card className="rounded-xl shadow-soft p-0 border-0">
            <CardContent className="pt-6 pb-4 px-5 flex flex-col gap-2">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[18px] font-bold text-neutral-900">{MOCK.name}</div>
                  <div className="flex items-center text-xs text-neutral-500 mt-0.5 gap-1">
                    <MapPin size={16} className="text-terra-700 mr-1" />
                    {MOCK.address}
                  </div>
                </div>
                {/* Share button */}
                <Button variant="ghost" size="icon" className="ml-2 p-2" title="Compartilhar local">
                  <Share2 size={18} className="text-[#AD4F36]" />
                </Button>
              </div>

              {/* Stars and reviews */}
              <div className="flex items-center gap-2 mt-1">
                <span className="flex items-center">
                  <Star size={17} fill="#E76F51" className="text-[#E76F51]" />
                  <span className="ml-0.5 font-bold text-terra-900 text-base">{MOCK.rating.toFixed(1)}</span>
                </span>
                <span className="text-xs text-neutral-600 font-inter">
                  ({MOCK.reviewsCount} avaliações)
                </span>
              </div>

              {/* Abrir no mapa */}
              <Button
                variant="outline"
                className="mt-4 flex items-center gap-2 border-[#E76F51] text-[#E76F51] hover:bg-[#FAF3EC]"
                style={{ fontWeight: 600, width: "fit-content" }}
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(MOCK.address)}`,
                    "_blank"
                  )
                }
              >
                <MapPin size={16} className="mr-1" />
                Abrir no mapa
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Reviews Section */}
        <section className="mt-6 px-4">
          <div className="bg-white rounded-xl shadow-card p-5">
            <div className="font-bold text-[15px] mb-1 text-terra-700">
              Avaliações recentes
            </div>
            <div className="flex flex-col gap-3">
              {MOCK.reviews.slice(0, 3).map((r, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#F9E1DA] flex items-center justify-center text-[16px] font-semibold text-terra-800">
                    {r.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-terra-900 text-sm">{r.name}</span>
                      <Star size={13} fill="#E76F51" className="ml-1 text-terra-600" />
                      <span className="text-xs font-bold text-neutral-700">{r.rating.toFixed(1)}</span>
                      <span className="text-xs ml-1 text-neutral-400">{r.timestamp}</span>
                    </div>
                    <div className="text-xs text-neutral-700 mt-0.5">{r.comment}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Opening Hours */}
        <section className="mt-5 px-4">
          <div className="bg-white rounded-xl shadow-soft px-6 py-4">
            <div className="font-bold text-[15px] mb-2 text-terra-700">
              Horário de funcionamento
            </div>
            <table className="w-full text-xs font-inter">
              <tbody>
                {MOCK.businessHours.map(([day, hour], idx) => (
                  <tr key={day} className={idx % 2 === 0 ? "bg-[#FAF3EC]" : ""}>
                    <td className="py-1 pr-4 font-medium text-[#AD4F36]">{day}</td>
                    <td className="py-1 text-[#6D4530]">{hour}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Fixed CTA */}
      <footer className="fixed inset-x-0 bottom-0 z-20 bg-[#FAF3EC] pb-safe px-4 pt-3 border-t border-[#E76F51]/10 flex flex-col items-stretch">
        <Button
          variant="default"
          className="w-full h-12 bg-[#E76F51] hover:bg-[#C9583C] text-white rounded-lg font-semibold text-base shadow-soft transition"
          onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(MOCK.address)}`, "_blank")}
        >
          Ir até o local
        </Button>
      </footer>
    </div>
  );
};

export default PlaceDetailsPage;
