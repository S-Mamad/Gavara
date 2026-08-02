import { test, expect } from "@playwright/test";

test.describe("Raxin landing page", () => {
  test("hero, work and contact are visible", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "راکسین‌شاپ" }),
    ).toBeVisible({ timeout: 15_000 });

    await page.getByRole("button", { name: "مدیریتی" }).click();
    await expect(page.getByText(/پایداری و رشد/)).toBeVisible();

    await page.getByRole("link", { name: "کارها" }).first().click();
    await expect(page.locator("#work")).toBeInViewport();
    await expect(page.getByText("حاجی عسل")).toBeVisible();
    await expect(page.getByText("مرهم").first()).toBeVisible();

    await page.locator("#contact").scrollIntoViewIfNeeded();
    await expect(page.getByLabel("نام")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "ارسال درخواست" }),
    ).toBeVisible();
  });

  test("mobile viewport shows hero and menu", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "راکسین‌شاپ" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "باز کردن منو" }).click();
    await expect(page.getByRole("link", { name: "ارتباط" })).toBeVisible();
  });
});
