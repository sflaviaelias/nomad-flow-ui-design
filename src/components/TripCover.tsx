import { useState } from "react";
import { Compass, MapPin } from "lucide-react";
import { useTripCover } from "@/hooks/useTripCover";

type Props = { tripId: string; destination: string; hero?: boolean };
export default function TripCover({ tripId, destination, hero = false }: Props) {
  const cover = useTripCover(tripId, destination);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  const photo = cover.data?.photo;
  const visiblePhoto = photo && failedUrl !== photo.url;
  const loading = cover.isFetching || (visiblePhoto && loadedUrl !== photo.url);
  return <div className="relative isolate overflow-hidden bg-terracotta-light">
    <div className={`relative flex items-center justify-center overflow-hidden ${hero ? "h-64 sm:h-80 lg:h-[26rem]" : "h-56 sm:h-60"}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-cream via-terracotta-light to-[#DFC8BC]" />
      <div aria-hidden="true" className="absolute -right-16 -top-20 h-72 w-72 rounded-full border border-terracotta/20" />
      <div aria-hidden="true" className="absolute -bottom-28 -left-16 h-80 w-80 rounded-full border-[28px] border-white/30" />
      <div className="relative flex flex-col items-center px-6 text-center text-accent">
        <Compass aria-hidden="true" className="mb-3 h-12 w-12 stroke-1 text-terracotta-dark" />
        <p className="text-xs font-semibold uppercase tracking-[0.2em]">Go Nomad</p>
        <p className="mt-2 text-sm">Cada destino, uma nova história.</p>
        {!loading && !visiblePhoto && <span className="mt-3 text-xs text-accent">Foto do destino indisponível</span>}
      </div>
      {visiblePhoto && <img key={photo.url} src={photo.url} alt={`Vista de ${destination}`} loading={hero ? "eager" : "lazy"} decoding="async"
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 motion-reduce:transition-none ${loadedUrl === photo.url ? "opacity-100" : "opacity-0"}`}
        onLoad={() => setLoadedUrl(photo.url)} onError={() => setFailedUrl(photo.url)} />}
      {loading && <span role="status" className="absolute bottom-4 left-4 rounded-full bg-white/95 px-3 py-1 text-xs text-accent">Carregando foto...</span>}
      <span className="absolute right-4 top-4 inline-flex max-w-[85%] items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-accent shadow-sm">
        <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /><span className="truncate">{destination}</span>
      </span>
    </div>
    {visiblePhoto && <p className="border-b border-terracotta/10 bg-cream px-4 py-2 text-[11px] leading-relaxed text-accent">
      Foto de <a href={photo.photographerUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{photo.photographer}</a>
      {" no "}<a href={photo.photoUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">Unsplash</a>
    </p>}
  </div>;
}
