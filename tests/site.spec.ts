import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("region keyboard selection prepopulates inquiry and download contains user details", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("tab", { name: "USA", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: "Europe", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await page.getByRole("link", { name: "Explore Europe" }).click();
  await expect(page.locator('select[name="region"]')).toHaveValue("Europe");
  await page.getByRole("button", { name: "Prepare my inquiry" }).click();
  await expect(page.locator('input[name="name"]')).toBeFocused();
  await page.getByLabel("Full name").fill("Test Buyer");
  await page.getByLabel("Email address").fill("buyer@example.com");
  await page
    .getByLabel("What are you looking for?")
    .fill("Looking for a used estate car from Europe.");
  await page.getByRole("button", { name: "Prepare my inquiry" }).click();
  await expect(page.getByText("Your inquiry is ready.")).toBeVisible();
  await expect(page.getByText(/Nothing has been sent/)).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download inquiry" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("logistic-hub-inquiry.txt");
  const stream = await download.createReadStream();
  const chunks = [];
  for await (const chunk of stream!) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString();
  expect(text).toContain("Region: Europe");
  expect(text).toContain("Test Buyer");
});

test("mobile menu, dealer page, FAQs and layouts work", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).not.toBeVisible();
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "For dealers" })
    .click();
  await expect(page).toHaveURL(/dealers/);
  await expect(
    page.getByRole("radio", { name: "Dealer", exact: true }),
  ).toBeChecked();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.goto("/");
  await page
    .getByText("Can you help if I have already found a vehicle?")
    .click();
  await expect(page.getByText(/^Yes\. Send us the auction lot/)).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("inquiry endpoint validates payload and never claims success without configuration", async ({
  request,
}) => {
  expect((await request.post("/api/inquiry", { data: {} })).status()).toBe(400);
  expect(
    (
      await request.post("/api/inquiry", {
        headers: { origin: "https://example.com" },
        data: {},
      })
    ).status(),
  ).toBe(403);
  const response = await request.post("/api/inquiry", {
    data: {
      name: "Test Buyer",
      email: "buyer@example.com",
      message: "Vehicle sourcing inquiry test",
      audience: "Private buyer",
      region: "USA",
    },
  });
  expect(response.status()).toBe(503);
  expect((await response.json()).error).toContain("not available");
});

for (const width of [1440, 390])
  test(`accessibility at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of [
      "/",
      "/dealers",
      "/calculator",
      "/ka/calculator",
      "/cars",
      "/ka/cars",
      "/admin/login",
    ]) {
      await page.goto(route, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      const scan = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(
        scan.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.map((n) => n.target),
        })),
      ).toEqual([]);
    }
  });

test("navbar page links open the new page at the top", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const [from, name, path] of [
    ["/", "For dealers", "/dealers"],
    ["/", "Fee calculator", "/calculator"],
    ["/calculator", "For dealers", "/dealers"],
  ]) {
    await page.goto(from);
    await page.evaluate(() => scrollTo(0, 1200));
    await page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("link", { name })
      .click();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await page.waitForTimeout(800);
    expect(await page.evaluate(() => scrollY)).toBe(0);
  }
});
