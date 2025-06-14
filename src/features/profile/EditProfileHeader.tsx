
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface EditProfileHeaderProps {
  title?: string;
  rightAction?: React.ReactNode;
}

export const EditProfileHeader: React.FC<EditProfileHeaderProps> = ({
  title = "Editar Perfil",
  rightAction
}) => {
  const navigate = useNavigate();
  return (
    <header className="w-full flex items-center justify-between px-4 pt-4 pb-2 bg-[#FAF3EC] shadow-soft rounded-b-lg select-none">
      <button
        className="flex items-center justify-center rounded-full hover:bg-[#E76F5115] transition"
        aria-label="Voltar"
        onClick={() => navigate(-1)}
        style={{ width: 44, height: 44, minWidth: 44, minHeight: 44 }}
      >
        <ArrowLeft size={24} className="text-[#E76F51]" />
      </button>
      <h1
        className="flex-1 text-center font-inter font-semibold text-lg md:text-xl"
        style={{
          color: "#E76F51",
          letterSpacing: "-0.01em"
        }}
      >
        {title}
      </h1>
      <div style={{ minWidth: 44, minHeight: 44 }} className="flex items-center justify-end">
        {rightAction ? rightAction : null}
      </div>
    </header>
  );
};
