import { test, expect } from "@playwright/test";
import { auctionFees } from "../lib/auction-fees";
import ru from "../lib/i18n/ru.json" with { type: "json" };
import ka from "../lib/i18n/ka.json" with { type: "json" };

const amounts = (...args: Parameters<typeof auctionFees>) =>
  auctionFees(...args).map((line) => line.amount);

test("fees follow the published Copart and IAAI schedules", () => {
  expect(amounts("Copart", 5000, "nonClean", "live")).toEqual([
    775, 125, 95, 15,
  ]);
  expect(amounts("Copart", 4999, "clean", "preBid")).toEqual([750, 99, 79, 15]);
  expect(amounts("Copart", 15000, "clean", "live")).toEqual([
    1087.5, 149, 79, 15,
  ]);
  expect(amounts("Copart", 14999, "nonClean", "preBid")).toEqual([
    1000, 140, 95, 15,
  ]);
  expect(amounts("Copart", 99, "nonClean", "live")).toEqual([45, 0, 95, 15]);
  expect(amounts("IAAI", 100, "clean", "preBid")).toEqual([80, 40, 105, 20]);
  expect(amounts("IAAI", 350, "nonClean", "live")).toEqual([145, 50, 105, 20]);
  expect(amounts("IAAI", 20000, "nonClean", "live")).toEqual([
    1500, 160, 105, 20,
  ]);
  expect(auctionFees("Copart", 0, "nonClean", "live")).toEqual([]);
  expect(auctionFees("IAAI", Number(""), "nonClean", "live")).toEqual([]);
});

test("calculator updates the breakdown as inputs change", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Fee calculator" })
    .click();
  await expect(page).toHaveURL(/\/calculator$/);
  const summary = page.locator(".fee-summary");
  await expect(summary.locator(".fee-subtotal dd")).toHaveText("$1,010");
  await expect(summary.locator(".fee-total dd")).toHaveText("$6,010");
  await page.getByRole("radio", { name: "Clean", exact: true }).check();
  await page.getByRole("radio", { name: "Pre-bid" }).check();
  await expect(summary.locator(".fee-subtotal dd")).toHaveText("$943");
  await page.getByRole("radio", { name: "IAAI" }).check();
  await expect(page.getByText("Title type")).toHaveCount(0);
  await page.getByLabel("Winning bid").fill("350");
  await expect(summary.getByText("Proxy bid fee")).toBeVisible();
  await expect(summary.locator(".fee-subtotal dd")).toHaveText("$310");
  await expect(summary.locator(".fee-total dd")).toHaveText("$660");
  await expect(
    summary.getByRole("link", { name: "View the IAAI schedule" }),
  ).toHaveAttribute("href", /iaai\.com/);
  await page.getByLabel("Winning bid").fill("");
  await expect(
    summary.getByText("Enter a winning bid to see the fees."),
  ).toBeVisible();
  await expect(page.locator("select[name=region]")).toHaveValue("USA");
});

for (const [lang, copy] of [
  ["ru", ru],
  ["ka", ka],
] as const) {
  test(`${lang}: calculator is translated and hydrates cleanly`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`/${lang}/calculator`);
    await expect(page.locator("html")).toHaveAttribute("lang", lang);
    await expect(page.locator(".fee-summary h2")).toHaveText(
      copy["Estimated auction fees"],
    );
    await expect(page.getByText(copy["Buyer fee"])).toBeVisible();
    await expect(page.locator(".fee-total dd")).toHaveText("$6 010");
    await page.getByRole("radio", { name: copy["Clean"], exact: true }).check();
    await expect(page.locator(".fee-total dd")).toHaveText("$5 953");
    expect(errors).toEqual([]);
    await page.setViewportSize({ width: 390, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}
