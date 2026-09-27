import { test, expect } from "@playwright/test";

test("browse, search, and open a found item", async ({ page }) => {
  await page.goto("/found-items");

  await expect(page.getByRole("heading", { name: "Found Items" })).toBeVisible();
  await expect(page.getByText("Black Nike Backpack")).toBeVisible();
  await expect(page.getByText("Scientific Calculator", { exact: true })).not.toBeVisible();

  await page.getByPlaceholder("Search found items…").fill("backpack");
  await expect(page.getByText("Black Nike Backpack")).toBeVisible();
  await expect(page.getByText("AirPods Pro")).not.toBeVisible();

  await page.getByRole("button", { name: "View details for Black Nike Backpack" }).click();
  await expect(page.getByRole("dialog", { name: "Black Nike Backpack details" })).toBeVisible();
  await expect(page.getByText("Ownership Check")).toBeVisible();
  await page.getByRole("button", { name: "Prove This Is Mine" }).click();
  await expect(page).toHaveURL(/\/verify-ownership\/catalog-backpack$/);
  await expect(page.getByRole("heading", { name: /Prove this is your Black Nike Backpack/ })).toBeVisible();
});

test("publish a found report to the catalog", async ({ page }) => {
  await page.goto("/report/found");

  await page.getByLabel("Item name *").fill("Coral Campus Umbrella");
  await page.getByLabel("Colour *").fill("Coral");
  await page.getByLabel("Campus area *").fill("Library — East Entrance");
  await page.getByLabel("Description *").fill("Compact coral umbrella with a curved handle.");
  await page.getByLabel("Date *").fill("2025-09-26");
  await page.getByLabel("Approximate time *").fill("14:20");
  await page.getByRole("textbox", { name: "Question *" }).nth(0).fill("What colour was the umbrella handle?");
  await page.getByRole("textbox", { name: "Expected answer *" }).nth(0).fill("Coral");
  await page.getByRole("textbox", { name: "Question *" }).nth(1).fill("Where was the umbrella last seen?");
  await page.getByRole("textbox", { name: "Expected answer *" }).nth(1).fill("Library east entrance");
  await page.getByRole("button", { name: "Submit found report" }).click();

  await page.goto("/found-items");
  await page.getByPlaceholder("Search found items…").fill("Coral Campus Umbrella");
  await expect(page.getByRole("heading", { name: "Coral Campus Umbrella" })).toBeVisible();
  await expect(page.getByText("Coral Campus Umbrella found near Library.")).toBeVisible();
});
