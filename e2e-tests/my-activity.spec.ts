import { test, expect } from "@playwright/test";

test("edit listing from My Activity persists after refresh", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByText("Black Nike Backpack", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Actions for Black Nike Backpack" }).click();
  await page.getByRole("link", { name: "Edit Listing" }).click();
  await page.getByRole("textbox").first().fill("Updated Nike Backpack");
  await page.getByRole("button", { name: "Save Changes" }).click();
  await expect(page.getByText("Listing updated successfully ✓")).toBeVisible();
  await page.reload();
  await expect(page.getByText("Updated Nike Backpack", { exact: true })).toBeVisible();
});

test("lost report actions do not include ownership-question editing", async ({ page }) => {
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Actions for Black Nike Backpack" }).click();
  await expect(page.getByRole("button", { name: "Ownership Check" })).not.toBeVisible();
  await expect(page.getByRole("link", { name: "Edit Listing" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Delete Listing" })).toBeVisible();
});

test("delete listing from My Activity removes it after refresh", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByText("Midnight AirPods Case", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Actions for Midnight AirPods Case" }).click();
  await page.getByRole("button", { name: "Delete Listing" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: "Delete this listing?" })).toBeVisible();
  await dialog.getByRole("button", { name: "Delete Listing" }).click();
  await expect(page.getByText("Listing deleted successfully ✓")).toBeVisible();
  await page.reload();
  await expect(page.getByText("Midnight AirPods Case", { exact: true })).not.toBeVisible();
});
