
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  backTo?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, showBack = false, backTo }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-2 py-4 px-4 md:px-8 bg-card shadow-soft rounded-b-lg mb-4">
      {showBack && (
        <button
          className="p-1 rounded-md hover:bg-teracotta-light text-terracotta transition"
          onClick={() => backTo ? navigate(backTo) : navigate(-1)}
          aria-label="Voltar"
        >
          <ArrowLeft size={24} />
        </button>
      )}
      <h2 className="font-bold text-lg md:text-xl text-neutral-900">{title}</h2>
    </div>
  );
};

export default PageHeader;
