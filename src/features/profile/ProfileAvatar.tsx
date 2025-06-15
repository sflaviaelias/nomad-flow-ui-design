import React, { useState, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera } from "lucide-react";

type Props = {
  avatarUrl?: string | null;
  editable?: boolean;
  onChange?: (file: File) => void;
  name?: string | null;
};

export function ProfileAvatar({ avatarUrl, editable, onChange, name }: Props) {
  const [preview, setPreview] = useState<string | null>(null);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setPreview(URL.createObjectURL(file));
    onChange && onChange(file);
  };

  // Limpa preview se avatarUrl for atualizado depois do upload (ex: após salvar)
  React.useEffect(() => {
    setPreview(null);
  }, [avatarUrl]);

  return (
    <div className="relative w-24 h-24 mx-auto">
      <Avatar className="w-24 h-24 border-4 border-terra-700">
        {avatarUrl && !preview && <AvatarImage src={avatarUrl} alt={name ?? "Avatar"} />}
        {preview && <AvatarImage src={preview} alt="" />}
        <AvatarFallback className="bg-terra-600 text-white font-bold">
          {name?.[0] ?? "?"}
        </AvatarFallback>
      </Avatar>
      {editable && (
        <label className="absolute bottom-1 right-1 bg-terra-600 rounded-full p-2 cursor-pointer shadow-lg hover:bg-terra-700">
          <Camera size={18} className="text-white" />
          <input
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={handleSelect}
            aria-label="Trocar avatar"
          />
        </label>
      )}
    </div>
  );
}
