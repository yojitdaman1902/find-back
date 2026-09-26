import { test, expect } from "@playwright/test";

test("open the secure chat inbox from My Activity", async ({ page }) => {
  await page.goto("/dashboard");

  await page.getByRole("link", { name: "Open Chat" }).click();
  await expect(page).toHaveURL(/\/chat$/);
  await expect(page.getByRole("heading", { name: "Chat, without giving away your contact details." })).toBeVisible();
  await expect(page.getByText("No conversations yet")).toBeVisible();
  await expect(page.getByRole("link", { name: "Browse found items" })).toBeVisible();
});
