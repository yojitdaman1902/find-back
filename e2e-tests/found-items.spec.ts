import { test, expect } from "@playwright/test";

test("browse, search, and open a found item", async ({ page }) => {
  await page.goto("/found-items");

  await expect(page.getByRole("heading", { name: "Found Items" })).toBeVisible();
  await expect(page.getByText("Black Nike Backpack")).toBeVisible();
  await expect(page.getByText("31").first()).toBeVisible();

  await page.getByPlaceholder("Search found items…").fill("backpack");
  await expect(page.getByText("Black Nike Backpack")).toBeVisible();
  await expect(page.getByText("AirPods Pro")).not.toBeVisible();

  await page.getByRole("button", { name: "View details for Black Nike Backpack" }).click();
  await expect(page.getByRole("dialog", { name: "Black Nike Backpack details" })).toBeVisible();
  await expect(page.getByText("Privacy-first ownership checks")).toBeVisible();
});
