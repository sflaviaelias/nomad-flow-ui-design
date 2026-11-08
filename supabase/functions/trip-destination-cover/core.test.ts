import { describe, expect, it, vi } from "vitest";
import { findPhoto, getOrSelectCover, isCoverPhoto, resolveDestination, type CoverPhoto, type CoverRecord, type CoverStore } from "./core";
const photo: CoverPhoto = { provider: "unsplash", id: "albania-photo", url: "https://images.unsplash.com/albania", photoUrl: "https://unsplash.com/photos/albania-photo", photographer: "Fotógrafa", photographerUrl: "https://unsplash.com/@fotografa", destinationKey: "AL" };
function storeWith(initial: CoverRecord | null = null) {
  let row = initial;
  const store: CoverStore = {
    read: vi.fn(async () => row),
    claim: vi.fn(async (_id, destination, existing, now) => {
      if (row !== existing) return null;
      row = { destination, request_key: "claim", status: "pending", photo: null, retry_after: new Date(now.getTime() + 90_000).toISOString() };
      return "claim";
    }),
    finish: vi.fn(async (_id, key, value) => { if (row?.request_key !== key) return false; row = value; return true; }),
  };
  return store;
}
const albaniaDetail = { id: "albania-photo", width: 1600, height: 1000, urls: { regular: photo.url }, links: { html: photo.photoUrl }, user: { name: photo.photographer, links: { html: photo.photographerUrl } }, location: { country: "Albania", city: "Tirana", position: { latitude: 41.3, longitude: 19.8 } } };
function provider(detail = albaniaDetail) {
  return vi.fn(async (url: string) => new Response(JSON.stringify(url.includes("/search/") ? { results: [{ id: "albania-photo" }] } : url.endsWith("/download") ? {} : detail), { status: 200 }));
}
describe("Capas com localização verificável", () => {
  it("normaliza Albânia e aceita cidade apenas com país explícito", () => {
    expect(resolveDestination("  ALBÂNIA ")?.key).toBe("AL");
    expect(resolveDestination("Albania")?.key).toBe("AL");
    expect(resolveDestination("Porto, Portugal")?.key).toBe("PT:porto");
    for (const place of ["Porto", "Paris", "Georgia", "Destino inventado", "Albânia e Itália"]) expect(resolveDestination(place)).toBeNull();
  });
  it("não chama provedor para destino ambíguo nem sem chave", async () => {
    const http = provider();
    expect(await findPhoto("Porto", "chave-ficticia", http as typeof fetch)).toBeNull();
    expect(await findPhoto("Albânia", "", http as typeof fetch)).toBeNull();
    expect(http).not.toHaveBeenCalled();
  });
  it("aceita foto georreferenciada da Albânia com crédito e tracking de seleção", async () => {
    const http = provider();
    const result = await findPhoto("Albânia", "chave-ficticia", http as typeof fetch);
    expect(result.id).toBe(photo.id);
    expect(result.photographerUrl).toContain("utm_source=go_nomad");
    expect(http.mock.calls.map(([url]) => url)).toEqual(expect.arrayContaining(["https://api.unsplash.com/photos/albania-photo/download"]));
    expect(http.mock.calls).toHaveLength(3);
  });
  it("rejeita país incorreto, metadados ausentes, geotag externa, retrato e URL não confiável", async () => {
    for (const detail of [
      { ...albaniaDetail, location: { ...albaniaDetail.location, country: "Italy" } },
      { ...albaniaDetail, location: null },
      { ...albaniaDetail, location: { ...albaniaDetail.location, position: { latitude: 48.8, longitude: 2.3 } } },
      { ...albaniaDetail, width: 500 },
      { ...albaniaDetail, urls: { regular: "https://evil.example/photo" } },
    ]) {
      const http = provider(detail);
      expect(await findPhoto("Albânia", "chave-ficticia", http as typeof fetch)).toBeNull();
      expect(http.mock.calls).toHaveLength(2);
    }
  });
  it("rejeita outra cidade mesmo no país correto", async () => {
    const http = provider({ ...albaniaDetail, location: { ...albaniaDetail.location, city: "Durrës" } });
    expect(await findPhoto("Tirana, Albânia", "chave-ficticia", http as typeof fetch)).toBeNull();
  });
  it("não confia em links injetados no cache", () => {
    for (const url of ["javascript:alert(1)", "https://images.unsplash.com.evil.example/x", "https://user@images.unsplash.com/x", "http://images.unsplash.com/x"]) expect(isCoverPhoto({ ...photo, url }, "Albânia")).toBe(false);
    expect(isCoverPhoto(photo, "Portugal")).toBe(false);
  });
  it("falha HTTP ou limite do provedor não produz uma foto genérica", async () => {
    for (const status of [429, 500, 403]) {
      const http = vi.fn(async () => new Response("", { status }));
      await expect(findPhoto("Albânia", "chave-ficticia", http)).rejects.toThrow("indisponível");
    }
  });
});
describe("Persistência independente por viagem", () => {
  it("reutiliza a mesma foto após recriar o serviço, sem consultar API", async () => {
    const store = storeWith(), select = vi.fn(async () => photo);
    const first = await getOrSelectCover("trip-a", "Albânia", store, select);
    const second = await getOrSelectCover("trip-a", "Albânia", store, select, new Date("2099-01-01"));
    expect(second).toEqual(first);
    expect(select).toHaveBeenCalledTimes(1);
  });
  it("requisições concorrentes fazem uma única seleção", async () => {
    const store = storeWith(), select = vi.fn(async () => photo);
    const result = await Promise.all([getOrSelectCover("trip-a", "Albânia", store, select), getOrSelectCover("trip-a", "Albânia", store, select)]);
    expect(select).toHaveBeenCalledTimes(1);
    expect(result.some((r) => r.status === "ready")).toBe(true);
  });
  it("erros e ausência de imagem usam cooldown, sem bloquear a viagem", async () => {
    const store = storeWith(), select = vi.fn(async () => { throw new Error("429"); });
    const now = new Date("2030-01-01");
    expect(await getOrSelectCover("trip-a", "Albânia", store, select, now)).toEqual({ status: "unavailable", photo: null });
    await getOrSelectCover("trip-a", "Albânia", store, select, now);
    expect(select).toHaveBeenCalledTimes(1);
    await getOrSelectCover("trip-a", "Albânia", store, select, new Date("2030-01-03"));
    expect(select).toHaveBeenCalledTimes(2);
  });
  it("mudança de destino invalida a referência anterior", async () => {
    const store = storeWith(), select = vi.fn(async () => photo);
    await getOrSelectCover("trip-a", "Albânia", store, select);
    expect(await getOrSelectCover("trip-a", "Portugal", store, async () => null)).toEqual({ status: "unavailable", photo: null });
  });
  it("não exibe foto não persistida e permite recuperar lease expirado", async () => {
    const store = storeWith({ status: "pending", photo: null, destination: "Albânia", request_key: "old", retry_after: "2000-01-01" });
    store.finish = vi.fn(async () => false);
    expect(await getOrSelectCover("trip-a", "Albânia", store, async () => photo)).toEqual({ status: "pending", photo: null });
  });
});
