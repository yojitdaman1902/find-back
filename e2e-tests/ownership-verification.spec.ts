import { test, expect } from "@playwright/test";

test("found item claims go directly to ownership verification", async ({ page }) => {
  await page.goto("/found-items");
  await page.getByPlaceholder("Search found items…").fill("backpack");
  await page.getByRole("button", { name: "View details for Black Nike Backpack" }).click();
  await page.getByRole("button", { name: "Prove This Is Mine" }).click();

  await expect(page).toHaveURL(/\/verify-ownership\/catalog-backpack$/);
  await expect(page.getByRole("heading", { name: /Prove this is your Black Nike Backpack/ })).toBeVisible();
  await expect(page.getByText("Potential Matches")).not.toBeVisible();
  await expect(page.getByText("What colour was the keychain attached to your backpack?")).toBeVisible();
});

test("correct ownership answers pass with harmless formatting differences", async ({ page }) => {
  await page.goto("/verify-ownership/catalog-backpack");

  await page.getByLabel(/Question 1:/).fill("  red  ");
  await page.getByLabel(/Question 2:/).fill("macbook charger & notebook");
  await page.getByRole("button", { name: "Verify Ownership" }).click();

  await expect(page.getByText("✅ Ownership Verified")).toBeVisible();
  await expect(page.getByText("You've successfully verified ownership of this item.")).toBeVisible();
});

test("incorrect ownership answers are rejected without revealing individual results", async ({ page }) => {
  await page.goto("/verify-ownership/catalog-backpack");

  await page.getByLabel(/Question 1:/).fill("blue");
  await page.getByLabel(/Question 2:/).fill("different contents");
  await page.getByRole("button", { name: "Verify Ownership" }).click();

  await expect(page.getByText("❌ Ownership could not be verified.")).toBeVisible();
  await expect(page.getByText("Some of the information didn't match. Please try again.")).toBeVisible();
  await expect(page.getByText("Ownership Verified")).not.toBeVisible();
});

 test("lost report ownership questions are not exposed as a My Activity action", async ({ page }) => {
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Actions for Black Nike Backpack" }).click();
  await expect(page.getByRole("button", { name: "Ownership Check" })).not.toBeVisible();
  await expect(page.getByRole("link", { name: "Edit Listing" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Delete Listing" })).toBeVisible();
});

 test("lost reports keep private ownership questions in the report form", async ({ page }) => {
  await page.goto("/report/lost");
  await expect(page.getByRole("heading", { name: "Private Ownership Details" })).toBeVisible();
  await expect(page.getByText("These details are kept private and will only be used to verify ownership if your item is found.")).toBeVisible();
});
