
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

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img 
        src="/lovable-uploads/go-nomad-logo.png"
        alt="Go Nomad Logo"
        className={`${sizeClasses[size]} object-contain`}
        onLoad={() => console.log("[LogoMini] Logo carregada com sucesso")}
        onError={(e) => console.error("[LogoMini] Erro ao carregar logo:", e)}
      />
      {showText && (
        <span className={`font-bold tracking-tight text-[#C9583C] ${textSizeClasses[size]} font-inter`}>
          Go Nomad
        </span>
      )}
    </div>
  );
}
