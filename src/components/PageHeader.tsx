
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  backTo?: string;
  rightAction?: React.ReactNode; // Nova prop: ações secundárias (opcional)
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, showBack = false, backTo, rightAction }) => {
  const navigate = useNavigate();

  return (
    <header className="w-full flex items-center justify-between px-4 pt-4 pb-2 bg-[#FAF3EC] shadow-soft rounded-b-lg select-none">
      {/* Botão voltar */}
      {showBack ? (
        <button
          className="flex items-center justify-center rounded-full hover:bg-[#E76F5115] transition"
          onClick={() => backTo ? navigate(backTo) : navigate(-1)}
          aria-label="Voltar"
          style={{
            width: 44, height: 44, minWidth: 44, minHeight: 44
          }}
        >
          <ArrowLeft size={24} className="text-[#E76F51]" />
        </button>
      ) : (
        <div style={{ width: 44, height: 44 }} /> // Ocupa espaço
      )}

      {/* Título centralizado */}
      <h1
        className="flex-1 text-center font-inter font-semibold text-lg md:text-xl"
        style={{
          color: "#E76F51",
          letterSpacing: "-0.01em"
        }}
      >
        {title}
      </h1>

      {/* Direita: ação secundária ou espaçamento */}
      <div
        style={{ minWidth: 44, minHeight: 44 }}
        className="flex items-center justify-end"
      >
        {rightAction ? rightAction : null}
      </div>
    </header>
  );
};

export default PageHeader;
