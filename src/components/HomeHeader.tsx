
import React from "react";
import LogoMini from "./LogoMini";

type Props = {
  user: { name: string; avatarUrl: string };
  onAvatarClick?: () => void;
};

export default function HomeHeader({ user, onAvatarClick }: Props) {
  return (
    <header className="flex items-center justify-between px-3 pt-4 pb-2 bg-[#FAF3EC] select-none">
      <LogoMini />
      <img
        src={user.avatarUrl}
        alt={`Avatar de ${user.name}`}
        className="w-10 h-10 rounded-full ring-2 ring-[#E76F51] object-cover cursor-pointer"
        onClick={onAvatarClick}
        draggable={false}
        style={{ minWidth: 44, minHeight: 44 }}
      />
    </header>
  );
}
