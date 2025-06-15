
import { useState, useEffect } from "react";

export function useCurrencyConversion(amount: number, from: string, to: string) {
  const [converted, setConverted] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!amount || !from || !to || from === to) {
      setConverted(amount || 0);
      return;
    }
    setLoading(true);
    fetch(`https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=${amount}`)
      .then(res => res.json())
      .then(data => {
        setConverted(Number(data.result));
      })
      .catch(() => setConverted(null))
      .finally(() => setLoading(false));
  }, [amount, from, to]);

  return { converted, loading };
}
