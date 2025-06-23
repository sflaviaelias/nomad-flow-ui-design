
import React from "react";

interface LogoMiniProps {
  size?: "small" | "medium" | "large";
  showText?: boolean;
  className?: string;
}

export default function LogoMini({ size = "small", showText = true, className = "" }: LogoMiniProps) {
  const sizeClasses = {
    small: "w-8 h-8",
    medium: "w-12 h-12", 
    large: "w-16 h-16"
  };

  const textSizeClasses = {
    small: "text-lg",
    medium: "text-xl",
    large: "text-2xl"
  };

  // Debug log temporário para verificar se a logo está sendo renderizada
  console.log("[LogoMini] Deploy Debug - Logo renderizada com size:", size, "showText:", showText);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img 
        src="/lovable-uploads/78fdfd19-ff72-4092-9052-7c83a8f1e12f.png"
        alt="Go Nomad Logo"
        className={`${sizeClasses[size]} object-contain`}
        onLoad={() => console.log("[LogoMini] Deploy Debug - Imagem da logo carregada com sucesso")}
        onError={(e) => console.error("[LogoMini] Deploy Debug - Erro ao carregar logo:", e)}
      />
      {showText && (
        <span className={`font-bold tracking-tight text-[#C9583C] ${textSizeClasses[size]} font-inter`}>
          Go Nomad
        </span>
      )}
    </div>
  );
}
