
import React from "react";
import LogoMini from "@/components/LogoMini";

export default function OnboardingHeader() {
  return (
    <header className="w-full flex flex-col items-center pt-8 pb-6 bg-[#FAF3EC]">
      <LogoMini size="large" showText={true} className="mb-2" />
      <div className="w-16 h-1 bg-[#E76F51] rounded-full opacity-60"></div>
    </header>
  );
}
