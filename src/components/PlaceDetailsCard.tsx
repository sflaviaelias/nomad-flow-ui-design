
import React from "react";
import { Star } from "lucide-react";

type Props = {
  rating: number;
  distance: number;
  address: string;
  openHours: string;
  tags: string[];
};

const PlaceDetailsCard: React.FC<Props> = ({
  rating, distance, address, openHours, tags,
}) => (
  <div className="bg-white rounded-xl shadow-soft p-5 flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Star size={18} className="text-[#E76F51]" fill="#E76F51" strokeWidth={1.5} />
        <span className="text-base font-bold text-neutral-900">{rating?.toFixed(1) || "--"}</span>
      </div>
      <div className="text-xs text-neutral-600">
        {distance?.toFixed(1)} km de você
      </div>
    </div>
    <div>
      <div className="text-[15px] text-neutral-800 font-medium">{address}</div>
      <div className="text-xs text-neutral-500 mt-0.5">Horário: {openHours}</div>
    </div>
    <div className="flex flex-wrap gap-2 mt-1">
      {tags.map((tag) => (
        <span
          key={tag}
          className="px-2 py-0.5 text-xs bg-[#F9E1DA] text-[#C2513B] rounded font-inter"
        >
          {tag}
        </span>
      ))}
    </div>
  </div>
);

export default PlaceDetailsCard;
