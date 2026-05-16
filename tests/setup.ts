/// <reference types="vitest/globals" />
import "@testing-library/jest-dom";

// Provide localStorage for Zustand persist middleware
const localStorageMap = new Map<string, string>();
Object.defineProperty(window, "localStorage", {
  value: {
    getItem: (key: string) => localStorageMap.get(key) ?? null,
    setItem: (key: string, value: string) => localStorageMap.set(key, value),
    removeItem: (key: string) => localStorageMap.delete(key),
    clear: () => localStorageMap.clear(),
    get length() { return localStorageMap.size; },
    key: (index: number) => [...localStorageMap.keys()][index] ?? null,
  },
  writable: false,
});

// Mock Tauri APIs — not available in jsdom test environment
vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

vi.mock("@tauri-apps/plugin-dialog", () => ({
  open: vi.fn(),
  save: vi.fn(),
}));

vi.mock("@tauri-apps/plugin-fs", () => ({
  readTextFile: vi.fn(),
  writeTextFile: vi.fn(),
}));

// Mock window.__TAURI__ so tauriService guards work
Object.defineProperty(window, "__TAURI__", {
  value: undefined,
  writable: true,
});

// Suppress console.error noise in tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("Warning:") || args[0].includes("act("))
    ) {
      return;
    }
    originalConsoleError(...args);
  };
});

afterAll(() => {
  console.error = originalConsoleError;
});
