import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("region keyboard selection prepopulates the inquiry, which is sent", async ({
  page,
}) => {
  // A visitor of its own, so the per-visitor inquiry limit never applies.
  await page.setExtraHTTPHeaders({ "x-forwarded-for": `test-${Date.now()}` });
  await page.goto("/");
  await page.getByRole("tab", { name: "USA", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: "Europe", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await page.getByRole("link", { name: "Explore Europe" }).click();
  await expect(page.locator('select[name="region"]')).toHaveValue("Europe");
  await page.getByRole("button", { name: "Send inquiry" }).click();
  await expect(page.locator('input[name="name"]')).toBeFocused();
  await page.getByLabel("Full name").fill("Test Buyer");
  await page.getByLabel("Email address").fill("buyer@example.com");
  await page
    .getByLabel("What are you looking for?")
    .fill("Looking for a used estate car from Europe.");
  await page.getByRole("button", { name: "Send inquiry" }).click();
  await expect(page.getByText("Your inquiry is on its way.")).toBeVisible();
  // The form comes back empty for the next one.
  await page.getByRole("button", { name: "Send another inquiry" }).click();
  await expect(page.getByLabel("Full name")).toHaveValue("");
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

// Inquiries are limited per visitor (by IP address); each test run poses
// as a new visitor so repeated runs do not hit the limit.
const visitor = () => ({
  "x-forwarded-for": `test-${Date.now()}-${Math.random()}`,
});

test("inquiry endpoint validates the payload and keeps valid inquiries", async ({
  request,
}) => {
  const headers = visitor();
  expect(
    (await request.post("/api/inquiry", { headers, data: {} })).status(),
  ).toBe(400);
  expect(
    (
      await request.post("/api/inquiry", {
        headers: { origin: "https://example.com" },
        data: {},
      })
    ).status(),
  ).toBe(403);
  const response = await request.post("/api/inquiry", {
    headers,
    data: {
      name: "Test Buyer",
      email: "buyer@example.com",
      message: "Vehicle sourcing inquiry test",
      audience: "Private buyer",
      region: "USA",
    },
  });
  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ ok: true });
});

test("one visitor cannot send more than five inquiries in ten minutes", async ({
  request,
}) => {
  const headers = visitor();
  for (let i = 0; i < 5; i++)
    expect(
      (await request.post("/api/inquiry", { headers, data: {} })).status(),
    ).toBe(400);
  const blocked = await request.post("/api/inquiry", { headers, data: {} });
  expect(blocked.status()).toBe(429);
  expect((await blocked.json()).error).toContain("Too many inquiries");
  // Someone else is not affected.
  expect(
    (
      await request.post("/api/inquiry", { headers: visitor(), data: {} })
    ).status(),
  ).toBe(400);
});

test("shared links show a title, description and image in their language", async ({
  page,
  request,
}) => {
  const og = (property: string) =>
    page.locator(`meta[property="og:${property}"]`);
  for (const [path, lang, title] of [
    ["/", "en", "Logistic Hub — Your choice. Our responsibility."],
    ["/ka/dealers", "ka", "ავტოდილერებისთვის | Logistic Hub"],
    ["/ru/calculator", "ru", "Калькулятор аукционных сборов | Logistic Hub"],
    ["/cars", "en", "Cars from China | Logistic Hub"],
  ]) {
    await page.goto(path);
    await expect(og("title")).toHaveAttribute("content", title);
    await expect(og("description")).toHaveAttribute("content", /.{40}/);
    await expect(og("url")).toHaveAttribute(
      "content",
      new RegExp(`^https?://[^/]+${path === "/" ? "/?" : path}$`),
    );
    await expect(og("image")).toHaveAttribute(
      "content",
      new RegExp(`^https?://.+/images/share/logistic-hub-${lang}\\.jpg$`),
    );
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      "summary_large_image",
    );
  }
  const image = await request.get(`/images/share/logistic-hub-ka.jpg`);
  expect(image.headers()["content-type"]).toBe("image/jpeg");
});

test("search engines get robots rules and a sitemap in every language", async ({
  request,
}) => {
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Disallow: /admin");
  expect(robots).toMatch(/Sitemap: https?:\/\/\S+\/sitemap\.xml/);
  const sitemap = await (await request.get("/sitemap.xml")).text();
  for (const path of [
    "/",
    "/ru",
    "/ka",
    "/cars",
    "/ru/dealers",
    "/ka/calculator",
  ])
    expect(sitemap).toMatch(new RegExp(`<loc>https?://[^<]+${path}</loc>`));
  expect(sitemap).toContain('hreflang="x-default"');
  expect(sitemap).not.toContain("/admin");
  // Language links are absolute and point at final addresses.
  const ru = await (await request.get("/ru")).text();
  expect(ru).toMatch(/<link rel="canonical" href="https?:\/\/[^"]+\/ru"\/>/);
  // Only the real domain is indexed, never a temporary .vercel.app address.
  const temporary = await request.get("/", {
    headers: { host: "logistics-hub-ten.vercel.app" },
  });
  expect(temporary.headers()["x-robots-tag"]).toBe("noindex");
  expect((await request.get("/")).headers()["x-robots-tag"]).toBeUndefined();
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
