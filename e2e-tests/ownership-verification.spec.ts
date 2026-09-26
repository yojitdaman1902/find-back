import { test, expect } from "@playwright/test";

test("let a finder add private owner questions on a found report", async ({ page }) => {
  await page.goto("/report/found");

  await expect(page.getByRole("heading", { name: "Finder Verification Questions" })).toBeVisible();
  await expect(page.getByText("Ask questions only the rightful owner should be able to answer. These answers stay private until a claim is verified.")).toBeVisible();
  await expect(page.getByText("The expected answers are never shown on public found-item cards or to unverified claimants.")).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Question *" }).nth(0)).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Question *" }).nth(1)).toBeVisible();

  await page.getByRole("button", { name: "Add owner question" }).click();
  await expect(page.getByRole("textbox", { name: "Question *" }).nth(2)).toBeVisible();
});

test("verify ownership before opening secure chat", async ({ page }) => {
  await page.goto("/matches/match-backpack");

  await expect(page.getByRole("heading", { name: "Black Nike Backpack", level: 1 })).toBeVisible();
  await expect(page.getByText("AI match · 94%")).toBeVisible();
  await expect(page.getByText("Ownership verification ≠ AI match")).toBeVisible();

  await page.getByLabel(/Question 1:/).fill("red");
  await page.getByLabel(/Question 2:/).fill("macbook charger + notebook");
  await page.getByRole("button", { name: "Prove Ownership" }).click();

  await expect(page.getByText("Ownership verified", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Open secure chat" })).toBeVisible();
});