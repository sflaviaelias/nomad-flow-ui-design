
import React from "react";
import { ArrowRight } from "lucide-react";

export default function HomeExtraLinks() {
  const links = [
    {
      label: "Notícias locais",
      href: "#",
      icon: <ArrowRight className="w-4 h-4 text-[#C9583C]" />,
    },
    {
      label: "Comunidade",
      href: "#",
      icon: <ArrowRight className="w-4 h-4 text-[#C9583C]" />,
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          className="bg-[#F8F6F0] rounded-xl px-4 py-3 flex items-center justify-between hover:bg-[#FAF3EC] font-medium text-[#AD4F36] shadow-sm transition"
        >
          {l.label}
          {l.icon}
        </a>
      ))}
    </div>
  );
}
