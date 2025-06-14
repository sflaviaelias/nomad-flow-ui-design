
import React from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

interface HomeHeaderProps {
  userName: string;
  avatarUrl: string;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({ userName, avatarUrl }) => {
  const navigate = useNavigate();
  return (
    <header className="flex items-center justify-between px-4 pt-5 pb-2 bg-[#FAF3EC] rounded-b-xl shadow-none">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Abrir menu"
        onClick={() => navigate("/profile")}
      >
        <Menu className="text-[#E76F51]" size={28} />
      </Button>
      <div className="flex-1 flex flex-col items-center justify-center">
        <h1 className="font-bold text-xl leading-tight text-[#E76F51] font-inter">
          Olá, {userName}!
        </h1>
        <span className="text-sm text-[#6D4530] leading-tight font-inter">
          Seu painel de viagens
        </span>
      </div>
      <div onClick={() => navigate("/profile")} className="cursor-pointer">
        <Avatar className="w-10 h-10 border-2 border-[#E76F51] ring-2 ring-[#E76F51] shadow">
          <img
            src={avatarUrl}
            alt={`Avatar de ${userName}`}
            className="object-cover w-full h-full rounded-full"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                "https://ui-avatars.com/api/?background=E76F51&color=fff&size=128&name=" +
                encodeURIComponent(userName);
            }}
          />
        </Avatar>
      </div>
    </header>
  );
};
