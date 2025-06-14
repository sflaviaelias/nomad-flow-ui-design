
import React from "react";
import { Globe } from "lucide-react";

export function ProfileTripCountCard({ count = 0 }: { count?: number }) {
  return (
    <div className="flex flex-col items-center my-3">
      <div className="flex flex-col items-center shadow-soft bg-[#fff] rounded-full w-28 h-28 md:w-32 md:h-32 border-2 border-[#E76F51]/80 justify-center"
        style={{ boxShadow: "0 2px 8px rgba(231,111,81,0.05)" }}>
        <Globe size={38} className="text-[#E76F51] my-1" />
        <span className="text-4xl md:text-5xl font-extrabold font-inter text-[#E76F51] mt-2">{count}</span>
      </div>
      <span className="font-medium text-base font-inter mt-2 mb-1 text-[#E76F51]">Minhas Aventuras</span>
      <span className="text-terra-900 text-sm font-inter">
        {count === 0
          ? "Vamos começar a explorar o mundo!"
          : count === 1
            ? "1 viagem concluída"
            : `${count} viagens concluídas`}
      </span>
    </div>
  );
}
