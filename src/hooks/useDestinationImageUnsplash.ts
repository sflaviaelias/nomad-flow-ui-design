
import { useState, useEffect } from "react";

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

    fetch("/functions/v1/destination-image-unsplash", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destination }),
    })
      .then(res => res.json())
      .then((data) => {
        if (data.image_url) {
          setImageUrl(data.image_url);
        } else {
          setImageUrl(null);
        }
      })
      .catch(() => setImageUrl(null))
      .finally(() => setLoading(false));
  }, [destination]);

  return { imageUrl, loading };
}
