import { describe, it, expect, beforeEach } from "vitest";
import { useThemeStore } from "@/store/themeStore";

describe("useThemeStore", () => {
  beforeEach(() => {
    useThemeStore.setState({
      theme: "system",
      resolvedTheme: "light",
    });
  });

  it("starts with system theme", () => {
    expect(useThemeStore.getState().theme).toBe("system");
  });

  it("starts with light resolved theme", () => {
    expect(useThemeStore.getState().resolvedTheme).toBe("light");
  });

  it("sets theme to dark", () => {
    useThemeStore.getState().setTheme("dark");
    expect(useThemeStore.getState().theme).toBe("dark");
  });

  it("sets theme to light", () => {
    useThemeStore.getState().setTheme("light");
    expect(useThemeStore.getState().theme).toBe("light");
  });

  it("sets theme to system", () => {
    useThemeStore.getState().setTheme("dark");
    useThemeStore.getState().setTheme("system");
    expect(useThemeStore.getState().theme).toBe("system");
  });

  it("sets resolved theme to dark", () => {
    useThemeStore.getState().setResolvedTheme("dark");
    expect(useThemeStore.getState().resolvedTheme).toBe("dark");
  });

  it("sets resolved theme to light", () => {
    useThemeStore.getState().setResolvedTheme("dark");
    useThemeStore.getState().setResolvedTheme("light");
    expect(useThemeStore.getState().resolvedTheme).toBe("light");
  });

  it("theme and resolvedTheme can differ (system mode)", () => {
    useThemeStore.getState().setTheme("system");
    useThemeStore.getState().setResolvedTheme("dark");
    expect(useThemeStore.getState().theme).toBe("system");
    expect(useThemeStore.getState().resolvedTheme).toBe("dark");
  });
});
