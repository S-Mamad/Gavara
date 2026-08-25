import { test, expect } from "@playwright/test";

test.describe("Raxin landing page", () => {
  test("hero, work covers and contact are visible", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "راکسین" }),
    ).toBeVisible({ timeout: 15_000 });

    await expect(page.getByRole("img", { name: "مرهم" })).toBeVisible();
    await expect(page.getByRole("img", { name: "حاجی عسل" })).toBeVisible();
    await expect(page.getByText("marham.paziresh24.com")).toBeVisible();
    await expect(page.getByText("hajiasal.ir")).toBeVisible();

    await page.getByRole("link", { name: "کارها" }).first().click();
    await expect(page.locator("#work")).toBeInViewport();
    await expect(page.getByRole("heading", { name: "مرهم" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "حاجی عسل" })).toBeVisible();

    await page.locator("section#contact").scrollIntoViewIfNeeded();
    await expect(page.getByLabel("نام")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "ارسال پیام" }),
    ).toBeVisible();
  });

  test("mobile viewport shows hero and menu", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "راکسین" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "باز کردن منو" }).click();
    await expect(
      page.getByLabel("منوی موبایل").getByRole("link", { name: "ارتباط" }),
    ).toBeVisible();
  });
});
