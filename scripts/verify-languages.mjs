import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdirSync, writeFileSync } from "node:fs";
const browser = await chromium.launch();
const results = [];
mkdirSync(".impeccable/review/languages", { recursive: true });
for (const lang of ["en", "ru", "ka"])
  for (const width of [390, 1440]) {
    const context = await browser.newContext({
      viewport: { width, height: 1000 },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    for (const route of ["", "/dealers", "/calculator"]) {
      const url = `http://localhost:3100${lang === "en" ? "" : "/" + lang}${route}`;
      await page.goto(url, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      const name = `${lang}${route.replace("/", "-")}-${width}`;
      await page.screenshot({
        path: `.impeccable/review/languages/${name}.png`,
        fullPage: true,
      });
      await page.screenshot({
        path: `.impeccable/review/languages/${name}-top.png`,
      });
      const scan = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      const row = {
        name,
        lang: await page.locator("html").getAttribute("lang"),
        overflow: await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        errors,
        violations: scan.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.target),
        })),
        englishLeaks:
          lang === "en"
            ? []
            : await page
                .locator("main")
                .evaluate((el) =>
                  el.innerText
                    .split("\n")
                    .filter((s) =>
                      /Private buyer|Dealer$|Vehicle selection|Can you help|Expert inspection|More choice/.test(
                        s,
                      ),
                    ),
                ),
      };
      results.push(row);
      console.log(JSON.stringify(row));
    }
    await context.close();
  }
writeFileSync(
  ".impeccable/review/languages/results.json",
  JSON.stringify(results, null, 2),
);
await browser.close();
