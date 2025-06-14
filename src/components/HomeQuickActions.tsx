
import React from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, CalendarDays, Sparkle } from "lucide-react";

const btns = [
  {
    key: "active",
    label: "Viagem Ativa",
    icon: <MapPin className="w-7 h-7 text-[#E76F51]" />,
    path: "/trip/active",
  },
  {
    key: "upcoming",
    label: "Próximas Viagens",
    icon: <CalendarDays className="w-7 h-7 text-[#E76F51]" />,
    path: "/trips/upcoming",
  },
  {
    key: "concierge",
    label: "Concierge IA",
    icon: <Sparkle className="w-7 h-7 text-[#E76F51]" />,
    path: "/concierge",
  },
];

export default function HomeQuickActions() {
  const navigate = useNavigate();

  return (
    <div className="flex gap-3 justify-between w-full">
      {btns.map((b) => (
        <button
          key={b.key}
          className="flex-1 bg-white border border-[#E76F51]/10 rounded-lg flex flex-col items-center justify-center aspect-square min-w-[90px] max-w-[110px] shadow-soft hover:shadow-card transition"
          style={{ minHeight: 90 }}
          onClick={() => navigate(b.path)}
        >
          {b.icon}
          <span className="block text-xs sm:text-sm mt-2 font-medium text-[#C9583C] font-inter">{b.label}</span>
        </button>
      ))}
    </div>
  );
}
