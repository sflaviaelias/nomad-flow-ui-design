
import React from "react";
import { Star } from "lucide-react";

type Review = {
  user: string;
  stars: number;
  comment: string;
};

type Props = {
  reviews: Review[];
};

const PlaceReviewsSection: React.FC<Props> = ({ reviews }) => (
  <div>
    <div className="font-bold text-[15px] mb-2 text-terra-700">Avaliações recentes</div>
    <div className="flex flex-col gap-3">
      {reviews.slice(0, 3).map((r, i) => (
        <div
          key={i}
          className="bg-white rounded-lg px-4 py-3 flex flex-col shadow-card border border-[#E76F51]/10"
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold text-terra-900 text-sm">{r.user}</span>
            <div className="flex items-center gap-1 ml-2">
              <Star size={15} fill="#E76F51" className="text-terracotta" strokeWidth={1.3} />
              <span className="text-xs font-bold text-neutral-700">{r.stars.toFixed(1)}</span>
            </div>
          </div>
          <div className="text-xs text-neutral-600 mt-1">{r.comment}</div>
        </div>
      ))}
      {reviews.length === 0 && (
        <div className="text-xs text-neutral-500">Nenhuma avaliação ainda.</div>
      )}
    </div>
  </div>
);

export default PlaceReviewsSection;
