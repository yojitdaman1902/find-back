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

test("save ownership questions from My Activity persists after refresh", async ({ page }) => {
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Actions for Black Nike Backpack" }).click();
  await page.getByRole("button", { name: "Ownership Check" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Add Question" }).click();
  await dialog.getByRole("textbox").nth(2).fill("What was inside the side pocket?");
  await dialog.getByRole("textbox").nth(3).fill("Notebook");
  await dialog.getByRole("button", { name: "Save Ownership Check" }).click();
  await expect(page.getByText("Ownership questions saved ✓")).toBeVisible();
  await page.reload();
  await expect(page.getByText("✓ 3 questions configured", { exact: true })).toBeVisible();
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
