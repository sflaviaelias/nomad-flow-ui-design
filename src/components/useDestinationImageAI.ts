
import * as React from "react";

// URL da função edge do Supabase
const SUPABASE_DEST_IMAGE_FN_URL =
  "https://hxjjdutzpzrchfkrbxcd.functions.supabase.co/destination-image-ai";

export function useDestinationImageAI(destination: string) {
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  const [imgLoading, setImgLoading] = React.useState(false);

  React.useEffect(() => {
    if (!destination) {
      setImageUrl(null);
      return;
    }
    setImgLoading(true);
    setImageUrl(null);
    const fetchDestinationImageWithAI = async () => {
      try {
        const res = await fetch(SUPABASE_DEST_IMAGE_FN_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ destination }),
        });
        const data = await res.json();
        if (data.image_url) setImageUrl(data.image_url);
        else setImageUrl(null); // Nunca faz fallback para outra fonte
      } catch {
        setImageUrl(null); // Em erro, também retorna null
      } finally {
        setImgLoading(false);
      }
    };
    const handler = setTimeout(fetchDestinationImageWithAI, 750);
    return () => clearTimeout(handler);
  }, [destination]);

  return { imageUrl, imgLoading };
}
