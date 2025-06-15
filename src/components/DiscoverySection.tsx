
import React from "react";
import { MapPin, Search, Coffee } from "lucide-react";
import { useNavigate } from "react-router-dom";

const discoveries = [
  {
    name: "Mercados & Padarias",
    icon: <MapPin size={20} className="text-terracotta" />,
    desc: "Compras locais, comida e mais",
    action: "Explorar",
    route: "/discovery/mercados"
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
            className="min-w-[210px] bg-card rounded-lg shadow-sm px-5 py-4 flex flex-col gap-2 hover:shadow-md transition flex-shrink-0 text-left focus-visible:ring-2 ring-terracotta outline-none"
            style={{ fontFamily: "Inter, sans-serif", padding: 16, borderRadius: 12 }}
            onClick={() => navigate(item.route)}
            aria-label={item.name}
          >
            <div className="flex items-center gap-2 mb-1">
              {item.icon}
              <span className="font-bold text-base text-terracotta">{item.name}</span>
            </div>
            <div className="text-sm text-neutral-500">{item.desc}</div>
            <span className="mt-2 w-fit font-semibold text-accent hover:text-terracotta text-[17px]">
              {item.action}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DiscoverySection;
