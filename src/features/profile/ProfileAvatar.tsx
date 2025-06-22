
import React, { useState } from "react";
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
    
    // Cria preview local
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    
    // Chama função de upload
    onChange && onChange(file);
  };

  // Limpa preview se avatarUrl for atualizado depois do upload (ex: após salvar)
  React.useEffect(() => {
    if (avatarUrl && preview) {
      // Se temos uma URL definitiva, limpa o preview
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
  }, [avatarUrl]);

  // Determina qual imagem mostrar: preview > avatarUrl > fallback
  const imageToShow = preview || avatarUrl;

  return (
    <div className="relative w-24 h-24 mx-auto">
      <Avatar className="w-24 h-24 border-4 border-terra-700">
        {imageToShow && (
          <AvatarImage 
            src={imageToShow} 
            alt={name ?? "Avatar"} 
            className="object-cover"
            onError={(e) => {
              console.error("Erro ao carregar imagem do avatar:", imageToShow);
              // Se houver erro ao carregar, remove a URL para mostrar fallback
              if (preview) {
                setPreview(null);
              }
            }}
          />
        )}
        <AvatarFallback className="bg-terra-600 text-white font-bold text-lg">
          {name?.[0]?.toUpperCase() ?? "?"}
        </AvatarFallback>
      </Avatar>
      {editable && (
        <label className="absolute bottom-1 right-1 bg-terra-600 rounded-full p-2 cursor-pointer shadow-lg hover:bg-terra-700 transition-colors">
          <Camera size={18} className="text-white" />
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            className="hidden"
            onChange={handleSelect}
            aria-label="Trocar avatar"
          />
        </label>
      )}
    </div>
  );
}
