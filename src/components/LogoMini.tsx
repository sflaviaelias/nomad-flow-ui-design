
import React from "react";

// Simples, pode ser substituído por SVG do logo depois
export default function LogoMini() {
  return (
    <div className="flex items-center gap-1">
      <span className="w-7 h-7 bg-[#E76F51] rounded-lg flex items-center justify-center font-bold text-white text-lg select-none">G</span>
      <span className="font-bold tracking-tight text-[#C9583C] text-xl font-inter hidden sm:inline">Go Nomad</span>
    </div>
  );
}
