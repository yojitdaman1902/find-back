import { test, expect, type Page } from "@playwright/test";

async function fillBaseReport(page: Page, type: "lost" | "found") {
  await page.goto(`/report/${type}`);
  await page.getByLabel("Item name *").fill("Samsung Galaxy S24");
  await page.locator("select").first().selectOption("Electronics");
  await page.getByLabel("Colour *").fill("Graphite");
  await page.getByLabel("Campus area *").fill("Library — Main Entrance");
  await page.getByLabel("Description *").fill("Graphite Samsung Galaxy S24 with a clear case and a small blue sticker.");
  await page.getByLabel("Date *").fill("2026-09-27");
  await page.getByLabel("Approximate time *").fill("10:00");
  if (type === "found") {
    await page.getByRole("textbox", { name: "Question *" }).nth(0).fill("What colour is the sticker?");
    await page.getByRole("textbox", { name: "Expected answer *" }).nth(0).fill("Blue");
    await page.getByRole("textbox", { name: "Question *" }).nth(1).fill("Where was it found?");
    await page.getByRole("textbox", { name: "Expected answer *" }).nth(1).fill("Library main entrance");
  }
  await page.getByRole("button", { name: type === "lost" ? "Analyze my item" : "Submit found report" }).click();
  await expect(page).toHaveURL(/\/analysis$/);
}

test("recovered items leave active listings and future matching", async ({ page }) => {
  await fillBaseReport(page, "lost");
  await fillBaseReport(page, "found");

  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Lost reports" }).click();
  await page.getByRole("button", { name: "Actions for Samsung Galaxy S24" }).click();
  await page.getByRole("button", { name: "Mark as Recovered" }).click();

  await expect(page.getByText("Samsung Galaxy S24", { exact: true })).not.toBeVisible();
  await expect(page.getByText("Samsung Galaxy S24 marked as recovered ✓")).toBeVisible();

  await page.goto("/matches");
  await expect(page.getByText("Samsung Galaxy S24", { exact: true })).not.toBeVisible();

  await page.goto("/found-items");
  await page.getByPlaceholder("Search found items…").fill("Samsung Galaxy S24");
  await expect(page.getByRole("heading", { name: "No found items match your search." })).toBeVisible();

  await fillBaseReport(page, "found");
  await page.goto("/found-items");
  await page.getByPlaceholder("Search found items…").fill("Samsung Galaxy S24");
  await expect(page.getByRole("heading", { name: "Samsung Galaxy S24" })).toBeVisible();

  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Recovered" }).click();
  await expect(page.getByText("Samsung Galaxy S24", { exact: true })).toBeVisible();
  await expect(page.getByText(/Recovered:/)).toBeVisible();
});
