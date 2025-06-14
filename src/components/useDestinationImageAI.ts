
import * as React from "react";

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
        const res = await fetch("/functions/v1/destination-image-ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ destination }),
        });
        const data = await res.json();
        if (data.image_url) setImageUrl(data.image_url);
        else setImageUrl(`https://source.unsplash.com/600x350/?${encodeURIComponent(destination)},travel,city`);
      } catch {
        setImageUrl(`https://source.unsplash.com/600x350/?${encodeURIComponent(destination)},travel,city`);
      } finally {
        setImgLoading(false);
      }
    };
    const handler = setTimeout(fetchDestinationImageWithAI, 750);
    return () => clearTimeout(handler);
  }, [destination]);

  return { imageUrl, imgLoading };
}
