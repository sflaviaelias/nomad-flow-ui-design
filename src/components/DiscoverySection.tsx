
import React from "react";
import { MapPin, Search, Coffee } from "lucide-react";

const discoveries = [
  {
    name: "Mercados & Padarias",
    icon: <MapPin size={20} className="text-terracotta" />,
    desc: "Compras locais, comida e mais",
    action: "Explorar",
  },
  {
    name: "Cafés & Restaurantes",
    icon: <Coffee size={20} className="text-terracotta" />,
    desc: "Trabalhe, socialize, coma bem",
    action: "Ver Cafés",
  },
  {
    name: "Coworkings",
    icon: <Search size={20} className="text-terracotta" />,
    desc: "Os melhores espaços para trabalho",
    action: "Coworkings",
  },
  {
    name: "Notícias e Comunidade",
    icon: <MapPin size={20} className="text-terracotta" />,
    desc: "Fique por dentro do local",
    action: "Ver notícias",
  },
];

const DiscoverySection = () => (
  <section>
    <h3 className="font-semibold text-lg mb-3 text-neutral-800">Descoberta</h3>
    <div className="flex gap-4 overflow-x-auto pb-2">
      {discoveries.map((item) => (
        <div
          key={item.name}
          className="min-w-[210px] bg-card rounded-lg shadow-sm px-5 py-4 flex flex-col gap-2 hover:shadow-md transition flex-shrink-0"
        >
          <div className="flex items-center gap-2 mb-1">
            {item.icon}
            <span className="font-bold text-sm text-terracotta">{item.name}</span>
          </div>
          <div className="text-xs text-neutral-500">{item.desc}</div>
          <button className="mt-1 w-fit font-semibold text-accent hover:text-terracotta">
            {item.action}
          </button>
        </div>
      ))}
    </div>
  </section>
);

export default DiscoverySection;
