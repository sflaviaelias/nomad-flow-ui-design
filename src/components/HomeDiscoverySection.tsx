
import React from "react";
import { useNavigate } from "react-router-dom";

type DiscoveryItem = {
  name: string;
  desc: string;
  link: string; // Pode ser usado como o id/slug do local
};

type Block = {
  title: string;
  nearby: DiscoveryItem[];
};

type Props = {
  discoveryData: Block[];
};

export default function HomeDiscoverySection({ discoveryData }: Props) {
  const navigate = useNavigate();

  return (
    <section>
      {discoveryData.map(({ title, nearby }) => (
        <div key={title} className="mb-7">
          <h3 className="font-semibold text-base mb-2 text-[#AD4F36] font-inter px-1">{title}</h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {nearby.map((item, i) => (
              <div
                key={item.name}
                className="min-w-[165px] max-w-[190px] bg-white rounded-lg shadow-soft px-3 py-3 flex flex-col gap-1 flex-shrink-0 border border-[#E76F51]/10"
              >
                <div className="font-bold text-terracotta text-[15px]">{item.name}</div>
                <div className="text-xs text-neutral-500 mb-3">{item.desc}</div>
                <button
                  className="w-fit font-semibold text-[#E76F51] hover:text-[#C9583C] text-sm px-0.5 py-1"
                  onClick={() => {
                    // utilize o `link` como slug/id para navegar
                    // caso não tenha, pode gerar slug a partir do nome (simples), mas aqui usamos link
                    navigate(`/place/${encodeURIComponent(item.link || item.name)}`);
                  }}
                >
                  Ir para {item.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
