
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg"];

export function useAvatarUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Faz upload da imagem, retorna a URL pública ou erro
  const upload = async (file: File, userId: string) => {
    setError(null);

    // Validação de tipo/tamanho
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Formato inválido. Use JPG ou PNG.");
      return null;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError("Arquivo maior que 5MB.");
      return null;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const filePath = `${userId}.${ext}`;
      
      // Remove imagem antiga se existir (ignorado em caso de erro por não existir)
      await supabase.storage.from("avatars").remove([filePath]).catch(() => {});
      
      // Faz upload (pode sobrescrever)
      const { data, error: uploadError } = await supabase.storage.from("avatars").upload(
        filePath,
        file,
        { upsert: true, cacheControl: "3600", contentType: file.type }
      );
      
      if (uploadError) {
        console.error("Upload error:", uploadError);
        setError(uploadError.message);
        setUploading(false);
        return null;
      }
      
      // Monta URL pública
      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(filePath);
      console.log("Public URL gerada:", pub?.publicUrl);
      
      setUploading(false);
      return pub?.publicUrl ?? null;
    } catch (e: any) {
      console.error("Upload exception:", e);
      setError(e.message || "Erro ao fazer upload.");
      setUploading(false);
      return null;
    }
  };

  return { upload, uploading, error };
}
