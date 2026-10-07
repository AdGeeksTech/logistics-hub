import { test, expect, type BrowserContext, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readdirSync } from "node:fs";

// Run against `npm run dev:e2e`, which starts the site with this local-only
// admin password and a separate data folder, so tests never touch real data.
const password = "local-e2e-only-password";
const uploads = ".data/e2e/uploads";
const base = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3001";
test.describe.configure({ mode: "serial" });

async function signIn(page: Page, context: BrowserContext) {
  await context.addCookies([{ name: "lh_admin_lang", value: "en", url: base }]);
  await page.goto("/admin/login");
  await page.locator("input[name=password]").fill(password);
  await page.locator("input[name=password]").press("Enter");
  await expect(page).toHaveURL(/\/admin\/cars$/);
}
const violations = async (page: Page) =>
  (
    await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze()
  ).violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) }));
const photoCount = () => {
  try {
    return readdirSync(uploads).length;
  } catch {
    return 0;
  }
};

test("admin pages, uploads and previews require a session", async ({
  page,
  request,
}) => {
  await page.goto("/admin/cars");
  await expect(page).toHaveURL(/\/admin\/login$/);
  const upload = await request.post("/api/admin/photos", {
    multipart: { width: "1", height: "1" },
  });
  expect(upload.status()).toBe(401);
  const preview = await request.get("/api/admin/preview?path=/", {
    maxRedirects: 0,
  });
  expect(preview.headers().location).toContain("/admin/login");
});

test("a car is listed, edited, previewed as a draft and removed", async ({
  page,
  context,
  browser,
}) => {
  const before = photoCount();
  await signIn(page, context);
  await page.getByRole("link", { name: "Add a car" }).first().click();

  // Publishing needs photos and a price.
  await page.getByLabel("Make").fill("BYD");
  await page.getByLabel("Model", { exact: true }).fill("Seal");
  await page.getByRole("radio", { name: /^Available/ }).check();
  await page.getByRole("button", { name: "Save listing" }).click();
  await expect(
    page.getByText("Add at least one photo to publish"),
  ).toBeVisible();
  await expect(page.getByText("Add a price to publish")).toBeVisible();

  await page
    .locator("input[type=file]")
    .setInputFiles([
      "public/images/vehicle-detail.jpg",
      "public/images/hero-porsche.jpg",
    ]);
  await expect(page.locator(".photo-grid li img")).toHaveCount(2);
  await page.getByLabel("Version / trim").fill("Excellence AWD");
  await page.getByLabel("Year").fill("2024");
  await page.locator("select[name=body]").selectOption("sedan");
  await page.getByLabel("Mileage, km").fill("12000");
  await page.getByLabel("Power, hp").fill("530");
  await page.getByLabel("Battery capacity, kWh").fill("82.5");
  await page.getByLabel("Electric range, km").fill("580");
  await page.locator("select[name=drive]").selectOption("awd");
  await page.locator("select[name=color]").selectOption("blue");
  for (const feature of ["Heated seats", "Panoramic roof", "360° camera"])
    await page.getByLabel(feature).check();
  await page.getByLabel("Price, USD").fill("28500");
  await page.locator("select[name=location]").selectOption("transit");
  await page
    .locator("textarea[lang=en]")
    .fill("One owner.\nFull service history.");
  await page.getByRole("button", { name: "Save listing" }).click();
  await expect(page).toHaveURL(/\/admin\/cars\/\d+\?created=1$/);
  await expect(
    page.getByText("Saved. The listing is live on the site."),
  ).toBeVisible();
  const id = Number(/cars\/(\d+)/.exec(page.url())![1]);
  expect(await violations(page)).toEqual([]);

  // Visitors see it straight away, in every language.
  const visitor = await (await browser.newContext()).newPage();
  await visitor.goto("/cars");
  const card = visitor.locator(
    `.car-card:has(a[href="/cars/${id}-byd-seal-2024"])`,
  );
  await expect(card).toContainText("$28,500");
  await expect(card).toContainText("In transit");
  await card.click();
  await expect(visitor).toHaveURL(new RegExp(`/cars/${id}-byd-seal-2024$`));
  const specs = visitor.locator(".spec-table");
  await expect(specs).toContainText("82.5 kWh");
  await expect(specs).toContainText("580 km (CLTC)");
  await expect(specs).not.toContainText("Engine volume");
  await expect(visitor.getByText("Panoramic roof")).toBeVisible();
  await expect(visitor.locator(".car-description")).toHaveText(
    "One owner.\nFull service history.",
  );
  expect(await violations(visitor)).toEqual([]);
  await expect(visitor.locator(".gallery-main .gallery-count")).toHaveText(
    "1 / 2",
  );
  await visitor.getByRole("button", { name: "Next photo" }).click();
  await expect(visitor.locator(".gallery-main .gallery-count")).toHaveText(
    "2 / 2",
  );
  await expect(visitor.locator("textarea[name=message]")).toHaveValue(
    `I’m interested in this car: BYD Seal 2024, ID ${id}.`,
  );
  await visitor.goto(`/ka/cars/${id}`);
  await expect(visitor).toHaveURL(new RegExp(`/ka/cars/${id}-byd-seal-2024$`));
  await expect(visitor.locator(".spec-table")).toContainText("ელექტრო");
  // Georgian falls back to the English description when none is written.
  await expect(visitor.locator(".car-description")).toContainText("One owner.");
  await visitor.goto("/cars?fuel=petrol");
  await expect(visitor.getByText("No cars match these filters.")).toBeVisible();
  await visitor.goto("/");
  await expect(
    visitor.locator(`.latest-cars a[href="/cars/${id}-byd-seal-2024"]`),
  ).toBeVisible();

  // Edits and status changes show at once.
  await page.getByLabel("Price, USD").fill("27900");
  await page.getByRole("radio", { name: /^Reserved/ }).check();
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(
    page.getByText("Saved. The listing is live on the site."),
  ).toBeVisible();
  await visitor.goto("/cars");
  await expect(card).toContainText("$27,900");
  await expect(card.locator(".car-status")).toHaveText("Reserved");

  // A duplicate starts as a hidden draft that only preview mode shows.
  await page.getByRole("button", { name: "Duplicate as a new draft" }).click();
  await expect(
    page.getByText("This is a copy saved as a draft."),
  ).toBeVisible();
  const copy = Number(/cars\/(\d+)/.exec(page.url())![1]);
  expect(copy).not.toBe(id);
  expect((await visitor.goto(`/cars/${copy}`))?.status()).toBe(404);
  await page.goto(`/api/admin/preview?path=/cars/${copy}`);
  await expect(page.locator(".preview-banner")).toBeVisible();
  await expect(page.locator(".car-status-note")).toContainText("Draft");
  await page.getByRole("button", { name: "Exit preview" }).click();
  await expect(page.locator(".preview-banner")).toHaveCount(0);

  // Deleting both removes the photos they shared.
  page.on("dialog", (dialog) => dialog.accept());
  for (const listing of [copy, id]) {
    await page.goto(`/admin/cars/${listing}`);
    await page.getByRole("button", { name: "Delete listing" }).click();
    await expect(page).toHaveURL(/\/admin\/cars\?deleted=1$/);
    if (listing === copy) expect(photoCount()).toBe(before + 2);
  }
  expect(photoCount()).toBe(before);
  await visitor.goto("/cars");
  await expect(card).toHaveCount(0);
  await visitor.context().close();
});

test("site texts are saved as drafts, previewed and then published", async ({
  page,
  context,
  browser,
}) => {
  await signIn(page, context);
  page.on("dialog", (dialog) => dialog.accept());
  await page.goto("/admin/texts");
  const search = page.getByRole("searchbox", { name: "Search all texts" });
  await search.fill("YOUR NEXT CAR.");
  const field = page.locator(".text-item textarea[lang=en]");
  await expect(field).toHaveValue("YOUR NEXT CAR.");
  await field.fill("YOUR NEXT EV.");
  // A Georgian text on a prerendered page, too.
  await search.fill("Talk dealer opportunities");
  const dealerButton = page.locator(".text-item textarea[lang=ka]");
  const original = await dealerButton.inputValue();
  await dealerButton.fill("დილერებთან თანამშრომლობა");
  await page.getByRole("button", { name: "Save drafts" }).click();
  await expect(page.getByText("Saved as drafts.")).toBeVisible();

  const visitor = await (await browser.newContext()).newPage();
  await visitor.goto("/");
  await expect(visitor.locator(".hero h1")).toContainText("YOUR NEXT CAR.");
  await visitor.goto("/ka/dealers");
  await expect(visitor.locator(".dealer-hero .button")).toContainText(original);
  await page.goto("/api/admin/preview?path=/");
  await expect(page.locator(".hero h1")).toContainText("YOUR NEXT EV.");
  await page.getByRole("button", { name: "Exit preview" }).click();

  await page.goto("/admin/texts");
  await page.getByRole("button", { name: "Publish", exact: true }).click();
  await expect(page.getByText("Published.")).toBeVisible();
  await visitor.goto("/");
  await expect(visitor.locator(".hero h1")).toContainText("YOUR NEXT EV.");
  expect((await visitor.goto("/ka/dealers"))?.status()).toBe(200);
  await expect(visitor.locator(".dealer-hero .button")).toContainText(
    "დილერებთან თანამშრომლობა",
  );

  await search.fill("YOUR NEXT EV.");
  await page.getByRole("button", { name: "Restore the original" }).click();
  await search.fill("დილერებთან თანამშრომლობა");
  await page.getByRole("button", { name: "Restore the original" }).click();
  await page.getByRole("button", { name: "Publish", exact: true }).click();
  await expect(page.getByText("Published.")).toBeVisible();
  await visitor.goto("/");
  await expect(visitor.locator(".hero h1")).toContainText("YOUR NEXT CAR.");
  for (const path of ["/dealers", "/ka/dealers", "/ru/calculator"])
    expect((await visitor.goto(path))?.status()).toBe(200);
  await expect(visitor.locator("html")).toHaveAttribute("lang", "ru");
  await visitor.context().close();
});
