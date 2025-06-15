
import React from "react";

type Props = {
  image: string;
};

const PlaceBannerImage: React.FC<Props> = ({ image }) => (
  <div className="w-full aspect-[3/1.3] relative bg-[#dadada]">
    <img
      src={image}
      alt=""
      className="object-cover w-full h-full rounded-b-2xl shadow-sm"
      style={{ minHeight: 180, maxHeight: 240 }}
      draggable={false}
    />
  </div>
);

export default PlaceBannerImage;
