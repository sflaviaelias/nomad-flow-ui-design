
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface EditProfileHeaderProps {
  title?: string;
}

export const EditProfileHeader: React.FC<EditProfileHeaderProps> = ({
  title = "Editar Perfil",
}) => {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-2 py-4 px-4 md:px-8 bg-white shadow-soft rounded-b-lg mb-4">
      <button
        className="flex items-center justify-center p-0.5 sm:p-2 rounded-md transition hover:bg-terra-600/10 text-terra-700"
        style={{ minWidth: 44, minHeight: 44 }}
        aria-label="Voltar"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={24} />
      </button>
      <h1 className="flex-1 text-center font-bold text-xl text-terra-800" style={{ fontFamily: "Inter" }}>
        {title}
      </h1>
      <span style={{ width: 32 }} />
    </div>
  );
};
