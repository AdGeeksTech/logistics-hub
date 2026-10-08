import { test, expect } from "@playwright/test";
import ru from "../lib/i18n/ru.json" with { type: "json" };
import ka from "../lib/i18n/ka.json" with { type: "json" };
for (const [lang, copy] of [
  ["ru", ru],
  ["ka", ka],
] as const) {
  test(`${lang}: translated routes, validation, region prefill and sending`, async ({
    page,
  }) => {
    // A visitor of its own, so the per-visitor inquiry limit never applies.
    await page.setExtraHTTPHeaders({
      "x-forwarded-for": `test-${lang}-${Date.now()}`,
    });
    await page.goto(`/${lang}/?region=Europe#inquiry`);
    await expect(page.locator("html")).toHaveAttribute("lang", lang);
    await expect(page.locator("select[name=region]")).toHaveValue("Europe");
    await expect(
      page.getByRole("radio", { name: copy["Private buyer"], exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: copy["Send inquiry"], exact: true })
      .click();
    expect(
      await page
        .locator("input[name=name]")
        .evaluate((el: HTMLInputElement) => el.validationMessage),
    ).toBe(copy["Please fill in this field."]);
    await page
      .locator("input[name=name]")
      .fill(lang === "ru" ? "Иван Иванов" : "გიორგი გიორგაძე");
    await page.locator("input[name=email]").fill("test@example.com");
    await page
      .locator("textarea")
      .fill(
        lang === "ru"
          ? "Ищу автомобиль из Европы."
          : "ვეძებ ავტომობილს ევროპიდან.",
      );
    await page
      .getByRole("button", { name: copy["Send inquiry"], exact: true })
      .click();
    await expect(
      page.getByText(copy["Your inquiry is on its way."]),
    ).toBeVisible();
    await page.goto(`/${lang}/dealers?region=China#inquiry`);
    await expect(
      page.getByRole("radio", { name: copy.Dealer, exact: true }),
    ).toBeChecked();
    // The switcher works once the page has hydrated.
    await page.waitForLoadState("networkidle");
    await page.locator(".language-switcher select").selectOption("en");
    await expect(page).toHaveURL(/\/dealers\?region=China#inquiry$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await page.waitForLoadState("networkidle");
    await page.locator(".language-switcher select").selectOption(lang);
    await expect(page).toHaveURL(
      new RegExp(`/${lang}/dealers\\?region=China#inquiry$`),
    );
    await expect(page.locator("html")).toHaveAttribute("lang", lang);
  });
}
test("translation catalogues have matching keys and no missing entries", () => {
  expect(Object.keys(ru).sort()).toEqual(Object.keys(ka).sort());
  expect(Object.values(ru).every(Boolean)).toBe(true);
  expect(Object.values(ka).every(Boolean)).toBe(true);
});

test("navigation stays readable while resizing in every language", async ({
  page,
}) => {
  for (const locale of ["en", "ru", "ka"]) {
    await page.goto(locale === "en" ? "/" : `/${locale}`);
    await page.evaluate(() => document.fonts.ready);
    // Georgian's longer labels collapse the menu earlier.
    const collapse = locale === "ka" ? 1360 : 1200;
    for (const width of [
      390, 760, 761, 820, 1024, 1100, 1101, 1200, 1201, 1280, 1360, 1361, 1440,
    ]) {
      await page.setViewportSize({ width, height: 1000 });
      const menu = page.locator(".menu-toggle");
      if (width <= collapse) {
        await expect(menu).toBeVisible();
        await expect(page.locator(".desktop-nav")).toBeHidden();
      } else {
        await expect(menu).toBeHidden();
        await expect(page.locator(".desktop-nav")).toBeVisible();
      }
      expect(
        await page.locator(".header-inner").evaluate((el) => {
          const boxes = [...el.children]
            .map((c) => c.getBoundingClientRect())
            .filter((r) => r.width);
          return boxes.every(
            (r, i) =>
              r.left >= 0 &&
              r.right <= innerWidth &&
              (!i || r.left >= boxes[i - 1].right),
          );
        }),
      ).toBe(true);
    }
    await page.setViewportSize({ width: 820, height: 1000 });
    await page.locator(".menu-toggle").click();
    await expect(page.locator("#mobile-nav")).toBeVisible();
    await page.setViewportSize({ width: 1440, height: 1000 });
    await expect(page.locator("#mobile-nav")).toBeHidden();
    await expect(page.locator(".menu-toggle")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    await page.setViewportSize({ width: 820, height: 1000 });
    await expect(page.locator(".menu-toggle")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  }
});
