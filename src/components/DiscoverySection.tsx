
import React from "react";
import { MapPin, Search, Coffee } from "lucide-react";
import { useNavigate } from "react-router-dom";

const discoveries = [
  {
    name: "Mercados & Padarias",
    icon: <MapPin size={20} className="text-terracotta" />,
    desc: "Compras locais, comida e mais",
    action: "Explorar",
    route: "/discovery/markets"
  },
  {
    name: "Cafés & Restaurantes",
    icon: <Coffee size={20} className="text-terracotta" />,
    desc: "Trabalhe, socialize, coma bem",
    action: "Ver Cafés",
    route: "/discovery/cafes"
  },
  {
    name: "Coworkings",
    icon: <Search size={20} className="text-terracotta" />,
    desc: "Os melhores espaços para trabalho",
    action: "Coworkings",
    route: "/discovery/coworkings"
  },
  {
    name: "Notícias e Comunidade",
    icon: <MapPin size={20} className="text-terracotta" />,
    desc: "Fique por dentro do local",
    action: "Ver notícias",
    route: "/community"
  },
];

const DiscoverySection = () => {
  const navigate = useNavigate();

  return (
    <div>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {discoveries.map((item) => (
          <button
            key={item.name}
            className="min-w-[210px] bg-[#FAF3EC] rounded-xl shadow-soft px-5 py-4 flex flex-col gap-2 hover:shadow-md transition flex-shrink-0 text-left focus-visible:ring-2 ring-[#E76F51] outline-none border border-[#E76F51]/8"
            style={{ fontFamily: "Inter, sans-serif", padding: 16, borderRadius: 16 }}
            onClick={() => navigate(item.route)}
            aria-label={item.name}
          >
            <div className="flex items-center gap-2 mb-1">
              {item.icon}
              <span className="font-bold text-base text-[#E76F51]">{item.name}</span>
            </div>
            <div className="text-sm text-neutral-500">{item.desc}</div>
            <span className="mt-2 w-fit font-semibold text-[#6D4530] hover:text-[#E76F51] text-[17px]">
              {item.action}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DiscoverySection;

