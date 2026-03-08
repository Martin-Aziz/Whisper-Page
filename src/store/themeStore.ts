import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark" | "system" | "sunlit" | "dusk" | "moonlit";

export interface ThemeState {
  theme: ThemeMode;
  /** Resolved to "light" or "dark" based on system if mode is "system" */
  resolvedTheme: "light" | "dark";
  customBgColor: string | null;
  setTheme: (theme: ThemeMode) => void;
  setResolvedTheme: (resolved: "light" | "dark") => void;
  setCustomBgColor: (color: string | null) => void;
}

/**
 * Theme preference store.
 * Persists the user's theme choice. Actual DOM class toggling is handled
 * by the `useTheme` hook which subscribes to this store.
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "system",
      resolvedTheme: "light",
      customBgColor: null,

      setTheme: (theme) => set({ theme }),
      setResolvedTheme: (resolvedTheme) => set({ resolvedTheme }),
      setCustomBgColor: (customBgColor) => set({ customBgColor }),
    }),
    {
      name: "whisper-page-theme",
    }
  )
);
