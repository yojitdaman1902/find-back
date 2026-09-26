import { test, expect } from "@playwright/test";

test("collect private ownership clues on a lost report", async ({ page }) => {
  await page.goto("/report/lost");

  await expect(page.getByRole("heading", { name: "Private Ownership Details" })).toBeVisible();
  await expect(page.getByText("These details are kept private and will only be used to verify ownership if your item is found.")).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Question *" }).nth(0)).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Question *" }).nth(1)).toBeVisible();

  await page.getByRole("button", { name: "Add verification clue" }).click();
  await expect(page.getByRole("textbox", { name: "Question *" }).nth(2)).toBeVisible();
  await expect(page.getByText("FindBack never publishes these answers.")).toBeVisible();
});

test("let a finder add private owner questions", async ({ page }) => {
  await page.goto("/report/found");

  await expect(page.getByRole("heading", { name: "Finder Verification Questions" })).toBeVisible();
  await expect(page.getByText("Ask questions only the rightful owner should be able to answer.")).toBeVisible();
  await expect(page.getByText("The expected answers are never shown on public found-item cards or to unverified claimants.")).toBeVisible();
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
