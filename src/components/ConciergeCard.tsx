
import React from "react";
import { ArrowRight, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const suggestions = [
  "O que fazer hoje?",
  "Preciso de um coworking com café",
  "Tem evento local?",
];

const ConciergeCard = () => {
  const navigate = useNavigate();

  // Handler simples para navegar, opcionalmente com sugestão
  const abrirConcierge = (suggestion?: string) => {
    if (suggestion) {
      // Encoda a sugestão como query param ?q=sugestao
      navigate(`/concierge?q=${encodeURIComponent(suggestion)}`);
    } else {
      navigate("/concierge");
    }
  };

  return (
    <section className="bg-card rounded-lg shadow-card px-6 py-5 mb-6 flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-2">
        <Search className="text-terracotta" size={22} />
        <div className="font-semibold text-lg">Concierge IA</div>
      </div>
      <div className="text-sm text-neutral-600 mb-2">
        Converse com o Concierge para recomendações e informações locais.
      </div>
      <div className="flex gap-2 flex-wrap">
        {suggestions.map((s) => (
          <button
            key={s}
            className="rounded-md border border-terracotta px-3 py-1 text-sm font-medium text-terracotta hover:bg-terracotta hover:text-white transition"
            onClick={() => abrirConcierge(s)}
            type="button"
          >
            {s}
          </button>
        ))}
      </div>
      <div>
        <button
          className="mt-2 rounded-md bg-terracotta text-white px-5 py-2 font-semibold hover:bg-terracotta-dark transition flex items-center gap-2"
          onClick={() => abrirConcierge()}
          type="button"
        >
          Abrir Concierge <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
};

export default ConciergeCard;

