import { chromium } from "@playwright/test";
const browser = await chromium.launch({ headless: true });
for (const width of [1440, 390]) {
  const page = await browser.newPage({
    viewport: { width, height: 1000 },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://localhost:3001", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: `.impeccable/review/${width === 1440 ? "desktop" : "mobile"}.png`,
    fullPage: true,
  });
  await page.screenshot({ path: `.impeccable/review/hero-${width}.png` });
  console.log(
    JSON.stringify({
      width,
      overflow: await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      errors,
    }),
  );
  await page.goto("http://localhost:3001/dealers", {
    waitUntil: "networkidle",
  });
  await page.screenshot({
    path: `.impeccable/review/dealers-${width}.png`,
    fullPage: true,
  });
  await page.close();
}
await browser.close();
