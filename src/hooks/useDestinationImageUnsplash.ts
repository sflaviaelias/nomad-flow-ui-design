
import { useState, useEffect } from "react";

const UNSPLASH_ACCESS_KEY = "dT7hnxLL8npKckTupqY5O6q_XbV-7iRHW8UZso4R4nA"; // Demo, substitua por key própria se necessário

export function useDestinationImageUnsplash(destination: string) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!destination) {
      setImageUrl(null);
      return;
    }
    setLoading(true);
    setImageUrl(null);

    fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(destination)}&orientation=landscape&per_page=1`, {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.results?.[0]?.urls?.regular) {
          setImageUrl(data.results[0].urls.regular);
        } else {
          setImageUrl(null);
        }
      })
      .catch(() => setImageUrl(null))
      .finally(() => setLoading(false));
  }, [destination]);

  return { imageUrl, loading };
}
