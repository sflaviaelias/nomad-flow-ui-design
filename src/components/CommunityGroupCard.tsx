
import React from "react";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CommunityGroupCardProps {
  name: string;
  description: string;
  date?: string;
  members: number;
  onJoin: () => void;
}

export default function CommunityGroupCard({
  name,
  description,
  date,
  members,
  onJoin
}: CommunityGroupCardProps) {
  return (
    <div className="flex rounded-xl bg-white shadow-xs border border-[#E76F51]/10 p-4 mb-3 items-start gap-3">
      <div className="bg-[#FAF3EC] rounded-xl p-2 flex items-center justify-center mr-2">
        <Users className="text-[#E76F51]" size={26} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[#AD4F36] truncate">{name}</div>
        <div className="text-xs text-neutral-500 mb-1">{description}</div>
        <div className="text-xs flex items-center gap-2 text-neutral-400">
          {date && <span>{date}</span>}
          <span>• {members} membros</span>
        </div>
      </div>
      <Button
        size="sm"
        className="px-3 bg-[#E76F51] hover:bg-[#C9583C] text-white font-semibold rounded-lg"
        onClick={onJoin}
      >
        Entrar
      </Button>
    </div>
  );
}
