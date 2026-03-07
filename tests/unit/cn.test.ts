import { describe, it, expect } from "vitest";
import { cn } from "@/utils/cn";

describe("cn (class name utility)", () => {
  it("returns a single class unchanged", () => {
    expect(cn("p-4")).toBe("p-4");
  });

  it("merges multiple classes", () => {
    expect(cn("p-4", "m-2")).toBe("p-4 m-2");
  });

  it("ignores falsy values", () => {
    expect(cn("p-4", false, undefined, null, "m-2")).toBe("p-4 m-2");
  });

  it("resolves Tailwind conflicts (last wins)", () => {
    // tailwind-merge: double padding => the last one wins
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("handles conditional classes", () => {
    const isActive = true as boolean;
    expect(cn("base", isActive && "active")).toBe("base active");
  });

  it("handles false conditional classes", () => {
    const isActive = false as boolean;
    expect(cn("base", isActive && "active")).toBe("base");
  });

  it("returns empty string for no arguments", () => {
    expect(cn()).toBe("");
  });

  it("handles an array of classes", () => {
    expect(cn(["p-4", "m-2"])).toBe("p-4 m-2");
  });
});
