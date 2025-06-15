
import React from "react";
import { Newspaper } from "lucide-react";

interface CommunityNewsCardProps {
  title: string;
  summary: string;
  image?: string;
  date?: string;
  onClick?: () => void;
}

export default function CommunityNewsCard({
  title,
  summary,
  image,
  date,
  onClick,
}: CommunityNewsCardProps) {
  return (
    <button
      className="group flex items-start w-full rounded-xl bg-white shadow-xs border border-[#E76F51]/10 mb-3 overflow-hidden p-2 hover:shadow-md transition"
      onClick={onClick}
      type="button"
      aria-label={`Ver notícia: ${title}`}
      style={{ textAlign: "left" }}
    >
      {image ? (
        <img
          src={image}
          alt={title}
          className="w-16 h-16 object-cover rounded-lg mr-3 flex-shrink-0 bg-[#FAF3EC]"
        />
      ) : (
        <div className="w-16 h-16 rounded-lg bg-[#FAF3EC] flex items-center justify-center mr-3">
          <Newspaper size={26} className="text-[#E76F51]" />
        </div>
      )}
      <div className="flex flex-col flex-1 gap-1 pr-1">
        <div className="font-semibold text-[#AD4F36] text-base line-clamp-2 group-hover:underline">
          {title}
        </div>
        <div className="text-xs text-neutral-600 line-clamp-2">{summary}</div>
        {date && (
          <div className="text-xs text-[#E76F51] mt-1">{date}</div>
        )}
      </div>
    </button>
  );
}
