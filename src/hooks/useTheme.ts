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
      const allThemeClasses = ["dark", "sunlit", "dusk", "moonlit"];
      document.documentElement.classList.remove(...allThemeClasses);

      let resolvedThemeClass: "light" | "dark" | "sunlit" | "dusk" | "moonlit" = "light";

      if (theme === "system") {
        resolvedThemeClass = prefersDark ? "dark" : "light";
      } else {
        resolvedThemeClass = theme;
      }

      if (resolvedThemeClass !== "light") {
        document.documentElement.classList.add(resolvedThemeClass);
      }

      document.documentElement.classList.add("theme-transition");
      window.setTimeout(
        () => { document.documentElement.classList.remove("theme-transition"); },
        300
      );

      // setResolvedTheme only accepts 'light' or 'dark' right now to drive CodeMirror base theme.
      // We will map custom themes to light or dark base styles.
      const isDarkBase = ["dark", "moonlit"].includes(resolvedThemeClass);
      setResolvedTheme(isDarkBase ? "dark" : "light");
    }

    applyTheme(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      if (theme === "system") applyTheme(e.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => { mediaQuery.removeEventListener("change", handler); };
  }, [theme, setResolvedTheme]);
}
