import { describe, it, expect, vi, beforeEach } from "vitest";
import { tauriService } from "@/services/tauriService";

// We mock the inner tauri API
vi.mock("@tauri-apps/api/core", () => ({
    isTauri: () => false,
    invoke: vi.fn().mockResolvedValue(true),
}));

vi.mock("@tauri-apps/plugin-dialog", () => ({
    open: vi.fn(),
    save: vi.fn(),
}));

vi.mock("@tauri-apps/plugin-fs", () => ({
    readDir: vi.fn(),
    readTextFile: vi.fn(),
    writeTextFile: vi.fn(),
    BaseDirectory: { Document: 1 },
}));

describe("tauriService: Fallback Coverage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Set environment so fallbacks always trigger
        vi.stubEnv("NODE_ENV", "development");
    });

    describe("saveFilePicker", () => {
        it("returns development fallback filename", async () => {
            const result = await tauriService.saveFilePicker("SuggestedName.md");
            // The browser fallback returns undefined to mimic user cancellation since it can't open a system dialog
            expect(result).toBeUndefined();
        });
    });

    describe("writeFile", () => {
        it("executes without throwing in development fallback", async () => {
            // Because our mock is isTauri=false, the fallback kicks in. Let's ensure it doesn't throw.
            await expect(tauriService.writeFile("/mock/path/file.md", "content")).resolves.not.toThrow();
        });
    });

    describe("readDirectory", () => {
        it("returns mock directory entries", async () => {
            const result = await tauriService.readDirectory("/mock/path");

            expect(result).toHaveLength(4);
            expect(((result as { name: string }[])[0] || {}).name).toBe("Guide.markdown");
        });
    });
});
