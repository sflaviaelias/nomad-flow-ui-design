import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
Object.defineProperty(window, "matchMedia", { writable: true, value: (query: string) => ({
  matches: false, media: query, onchange: null, addListener: vi.fn(), removeListener: vi.fn(),
  addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn(),
}) });
vi.stubGlobal("ResizeObserver", class {
  observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn();
});
afterEach(() => { cleanup(); localStorage.clear(); sessionStorage.clear(); });
