// Renders the link-preview images (1200×630) shown when the site is shared
// on WhatsApp, Facebook, Telegram and similar: one per language, from the
// homepage headline, the site's fonts, its logo and the homepage photo.
//
//   npm run dev:e2e   (the logo is read from the running site)
//   node scripts/share-images.mjs [base URL, default http://localhost:3001]
//
// Run it again after changing the headline, the logo or the default photo.
import { chromium } from "@playwright/test";
import { readFileSync } from "node:fs";

const base = process.argv[2] || "http://localhost:3001";
// Fonts and the photo come from the site itself.
const file = (path) => `${base}/${path.replace(/^public\//, "")}`;
const dictionaries = {
  en: {},
  ru: JSON.parse(readFileSync("lib/i18n/ru.json", "utf8")),
  ka: JSON.parse(readFileSync("lib/i18n/ka.json", "utf8")),
};
// Same script-aware type as the site (see globals.css).
const type = {
  en: { font: "Display", size: 104, leading: 0.94 },
  ru: { font: "Cyrillic", size: 82, leading: 1.12 },
  ka: { font: "Georgian", size: 62, leading: 1.3 },
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(base);
const logo = await page
  .locator(".brand svg")
  .first()
  .evaluate((svg) => {
    svg.querySelector(".brand-star")?.setAttribute("fill", "#f2a541");
    return svg.outerHTML;
  });

for (const [lang, words] of Object.entries(dictionaries)) {
  const t = (key) => words[key] ?? key;
  const { font, size, leading } = type[lang];
  await page.setContent(`<!doctype html>
<html lang="${lang}"><head><meta charset="utf-8"><style>
@font-face { font-family: Display; src: url(${file("public/fonts/barlow-condensed-600.ttf")}); font-weight: 600; }
@font-face { font-family: Body; src: url(${file("public/fonts/manrope-variable.ttf")}); font-weight: 200 800; }
@font-face { font-family: Georgian; src: url(${file("public/fonts/noto-sans-georgian.ttf")}); font-weight: 100 900; }
@font-face { font-family: Cyrillic; src: url(${file("public/fonts/oswald.ttf")}); font-weight: 200 700; }
* { box-sizing: border-box; margin: 0; }
body {
  position: relative; width: 1200px; height: 630px; overflow: hidden;
  background: #16213a url(${file("public/images/hero-porsche.jpg")}) 58% 57% / cover;
  color: #fcfcf8; font-family: ${lang === "ka" ? "Georgian" : "Body"}, sans-serif;
}
body::before {
  content: ""; position: absolute; inset: 0;
  background:
    linear-gradient(90deg, rgba(9,14,28,.94) 0%, rgba(9,14,28,.86) 40%, rgba(9,14,28,.45) 62%, rgba(9,14,28,.1) 84%),
    linear-gradient(0deg, rgba(9,14,28,.8), transparent 32%);
}
main { position: relative; display: flex; flex-direction: column; height: 100%; padding: 60px 72px 58px; }
svg { align-self: flex-start; height: 46px; width: auto; overflow: visible; color: #fcfcf8; }
h1 {
  margin-top: auto; max-width: 720px;
  font: 600 ${size}px/${leading} ${font}, sans-serif; letter-spacing: -0.01em;
}
h1 span { color: #ef6a3a; }
p { display: flex; gap: 28px; margin-top: 30px; font-size: 25px; font-weight: 600; color: #c3c9d6; }
p b { width: 52px; height: 3px; margin-top: 16px; background: #ef6a3a; }
</style></head><body><main>
${logo}
<h1>${t("YOUR NEXT CAR.")}<br>${t("A WORLD OF")}<br><span>${t("POSSIBILITIES.")}</span></h1>
<p><b></b>${t("Vehicles from the USA, Europe and China.")}</p>
</main></body></html>`);
  await page.evaluate(async () => {
    await document.fonts.ready;
    const fonts = [...document.fonts].filter((f) => f.status === "loaded");
    if (!fonts.length) throw new Error("The site fonts did not load.");
  });
  await page.waitForLoadState("networkidle");
  await page.screenshot({
    path: `public/images/share/logistic-hub-${lang}.jpg`,
    type: "jpeg",
    quality: 86,
  });
  console.log(`public/images/share/logistic-hub-${lang}.jpg`);
}
await browser.close();
