
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
        src="/lovable-uploads/27904f0e-c6d8-4bb1-b158-ebbb5a1487e1.png"
        alt="Go Nomad Logo"
        className={`${sizeClasses[size]} object-contain`}
      />
      {showText && (
        <span className={`font-bold tracking-tight text-[#C9583C] ${textSizeClasses[size]} font-inter`}>
          Go Nomad
        </span>
      )}
    </div>
  );
}
