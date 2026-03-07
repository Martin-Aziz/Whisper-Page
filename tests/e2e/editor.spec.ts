import { test, expect } from "@playwright/test";

/**
 * E2E smoke tests for critical user journeys.
 * These tests require the Tauri dev server to be running or a built app.
 * They validate that the application loads and core interactions work.
 */
test.describe("Lumina Editor — Critical User Journeys", () => {
  test.beforeEach(async ({ page }) => {
    // In dev mode, the app is served at localhost:1420
    await page.goto("http://localhost:1420");
  });

  test("application loads and shows editor", async ({ page }) => {
    // Assert the toolbar is visible
    await expect(page.getByRole("banner", { name: "Editor toolbar" })).toBeVisible();

    // Assert the main editor area is present
    await expect(page.getByRole("main")).toBeVisible();

    // Assert the status bar is present
    await expect(page.getByRole("contentinfo", { name: "Status bar" })).toBeVisible();
  });

  test("typing in WYSIWYG mode updates word count", async ({ page }) => {
    const editor = page.locator(".ProseMirror").first();
    await editor.click();
    await editor.fill("Hello world foo bar");

    // Word count should update in status bar
    const statusBar = page.getByRole("contentinfo", { name: "Status bar" });
    await expect(statusBar).toContainText("4 word");
  });

  test("can switch between WYSIWYG and source mode", async ({ page }) => {
    // Click source mode button
    await page.getByRole("button", { name: "Source mode" }).click();
    await expect(page.locator(".source-editor")).toBeVisible();

    // Switch back to WYSIWYG
    await page.getByRole("button", { name: "WYSIWYG mode" }).click();
    await expect(page.locator(".ProseMirror")).toBeVisible();
  });

  test("can toggle focus mode via keyboard shortcut", async ({ page }) => {
    await page.keyboard.press("Meta+Shift+F");
    // In focus mode the toolbar should be invisible
    const toolbar = page.getByRole("banner", { name: "Editor toolbar" });
    await expect(toolbar).toHaveClass(/opacity-0/);

    // Toggle off
    await page.keyboard.press("Escape");
  });

  test("table insert modal opens and closes", async ({ page }) => {
    await page.getByRole("button", { name: "Insert table" }).click();
    await expect(page.getByRole("dialog", { name: "Insert Table" })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "Insert Table" })).not.toBeVisible();
  });

  test("export modal opens and shows options", async ({ page }) => {
    await page.getByRole("button", { name: "Export to PDF" }).click();
    await expect(page.getByRole("dialog", { name: "Export to PDF" })).toBeVisible();
    await expect(page.getByText("Page Size")).toBeVisible();

    await page.keyboard.press("Escape");
  });

  test("keyboard shortcut Cmd+\\ toggles sidebar", async ({ page }) => {
    // Sidebar starts hidden
    await expect(page.getByRole("complementary", { name: "File sidebar" })).not.toBeVisible();

    await page.keyboard.press("Meta+\\");
    await expect(page.getByRole("complementary", { name: "File sidebar" })).toBeVisible();

    await page.keyboard.press("Meta+\\");
    await expect(page.getByRole("complementary", { name: "File sidebar" })).not.toBeVisible();
  });
});
