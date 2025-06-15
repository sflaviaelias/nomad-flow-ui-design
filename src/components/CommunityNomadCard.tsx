
import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface CommunityNomadCardProps {
  name: string;
  avatar_url?: string | null;
  country?: string | null;
  stayPeriod?: string; // Ex: "até 22 de junho"
  onProfile?: () => void;
}

export default function CommunityNomadCard({
  name,
  avatar_url,
  country,
  stayPeriod,
  onProfile
}: CommunityNomadCardProps) {
  return (
    <div className="flex items-center rounded-xl bg-white shadow-xs p-4 mb-3 border border-[#E76F51]/10 gap-4">
      <Avatar className="w-12 h-12">
        {avatar_url ?
          <AvatarImage src={avatar_url} alt={name} /> :
          <AvatarFallback className="bg-[#FAF3EC] text-[#AD4F36] font-bold">
            {name.charAt(0).toUpperCase()}
          </AvatarFallback>
        }
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[#AD4F36] truncate">{name}</div>
        <div className="text-xs text-neutral-500 flex items-center gap-1">
          <span>{country}</span>
          {stayPeriod && <span>· {stayPeriod}</span>}
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="px-3 text-[#E76F51] border-[#E76F51] font-medium hover:bg-[#E76F51]/10 hover:text-[#AD4F36]"
        onClick={onProfile}
      >
        Ver perfil
      </Button>
    </div>
  );
}
