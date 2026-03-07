import { useEffect } from "react";
import { useThemeStore } from "@/store/themeStore";

/**
 * Subscribes to the theme store and syncs the `dark` CSS class on `<html>`.
 * Also listens for OS-level dark/light preference changes when in "system" mode.
 *
 * Must be mounted once at the app root.
 */
export function useTheme() {
  const { theme, setResolvedTheme } = useThemeStore();

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function applyTheme(prefersDark: boolean) {
      const isDark = theme === "dark" || (theme === "system" && prefersDark);
      document.documentElement.classList.toggle("dark", isDark);
      document.documentElement.classList.add("theme-transition");
      window.setTimeout(
        () => document.documentElement.classList.remove("theme-transition"),
        300
      );
      setResolvedTheme(isDark ? "dark" : "light");
    }

    applyTheme(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      if (theme === "system") applyTheme(e.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [theme, setResolvedTheme]);
}
