
import React from "react";
import { MapPin } from "lucide-react";

type Props = {
  // For now, no props: static preview
};

const MapPreview: React.FC<Props> = () => (
  <div className="relative w-full h-44 bg-[#dadada] flex items-center justify-center rounded-lg">
    <MapPin className="text-terra-600" size={40} strokeWidth={2} />
    <span className="sr-only">Mapa estático</span>
  </div>
);

export default MapPreview;
