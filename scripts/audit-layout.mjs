// Responsive layout audit: loads every page in every language, steps the
// viewport through common widths and reports text that is cut off, controls
// too narrow for their text, items that overlap or leave the screen, and
// grids whose columns should be equal but are not.
//
// Run against `npm run dev:e2e` (it signs in to the admin with that
// server's local password): node scripts/audit-layout.mjs [baseURL] [--public]
import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";

// --public skips the admin, e.g. to check a live deployment.
const publicOnly = process.argv.includes("--public");
const base =
  process.argv.slice(2).find((a) => !a.startsWith("--")) ||
  "http://localhost:3001";
const password = "local-e2e-only-password";
// prettier-ignore
const widths = [320, 360, 375, 390, 414, 480, 540, 600, 680, 760, 761, 820,
  900, 1000, 1050, 1051, 1120, 1200, 1201, 1280, 1360, 1361, 1440, 1680, 1920];
const equalGrids = [
  ".form-grid",
  ".audience-toggle",
  ".filter-range",
  ".car-key-specs",
  ".spec-table",
  ".feature-groups",
  ".inquiry-layout",
  ".calculator-layout",
  ".dealer-content",
  ".dealer-hero-grid",
  ".footer-links",
  ".text-item",
  ".car-grid",
  ".photo-grid",
  ".status-picker",
  ".field-grid",
  ".filter-fields",
  ".feature-picker",
];

function audit({ equalGrids }) {
  const out = [];
  const vw = document.documentElement.clientWidth;
  const ctx = document.createElement("canvas").getContext("2d");
  const textWidth = (text, el) => {
    const cs = getComputedStyle(el);
    ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    ctx.letterSpacing =
      cs.letterSpacing === "normal" ? "0px" : cs.letterSpacing;
    return ctx.measureText(text).width;
  };
  const name = (el) => {
    const parts = [];
    for (
      let n = el;
      n && n !== document.body && parts.length < 4;
      n = n.parentElement
    ) {
      let s = n.tagName.toLowerCase();
      if (n.id) {
        parts.unshift(`${s}#${n.id}`);
        break;
      }
      const cls = [...n.classList].slice(0, 2).join(".");
      if (cls) s += "." + cls;
      if (n.getAttribute("name")) s += `[name=${n.getAttribute("name")}]`;
      parts.unshift(s);
    }
    return parts.join(" > ");
  };
  const visible = (el) =>
    el.checkVisibility({ checkVisibilityCSS: true }) &&
    !el.closest(".sr-only, .honeypot, [aria-hidden=true] .sr-only");
  const clippedByScroller = (el) => {
    for (
      let n = el.parentElement;
      n && n !== document.body;
      n = n.parentElement
    ) {
      const o = getComputedStyle(n).overflowX;
      if (o === "auto" || o === "scroll") return true;
    }
    return false;
  };
  const snippet = (el) =>
    (el.value || el.placeholder || el.innerText || "").trim().slice(0, 50);
  const de = document.documentElement;
  if (de.scrollWidth > de.clientWidth + 1)
    out.push({
      type: "page scrolls sideways",
      el: "html",
      text: `${de.scrollWidth - de.clientWidth}px`,
    });

  for (const el of document.querySelectorAll("body *")) {
    if (
      [
        "SCRIPT",
        "STYLE",
        "svg",
        "path",
        "circle",
        "OPTION",
        "BR",
        "IMG",
        "source",
      ].includes(el.tagName)
    )
      continue;
    if (el.closest("svg, dialog:not([open])") || !visible(el)) continue;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    const cs = getComputedStyle(el);
    if (
      cs.position !== "fixed" &&
      !clippedByScroller(el) &&
      (r.right > vw + 1 || r.left < -1) &&
      el.innerText?.trim()
    )
      out.push({ type: "off screen", el: name(el), text: snippet(el) });
    if (
      el.tagName === "INPUT" &&
      ["text", "email", "tel", "search", "number", "password", ""].includes(
        el.type,
      )
    ) {
      // Typed values scroll inside the field; placeholders must fit.
      const text = el.value ? "" : el.placeholder;
      const room =
        el.clientWidth -
        parseFloat(cs.paddingLeft) -
        parseFloat(cs.paddingRight) -
        (el.type === "search" && el.value ? 20 : 0);
      if (text && textWidth(text, el) > room + 1)
        out.push({ type: "input too narrow", el: name(el), text });
      continue;
    }
    if (el.tagName === "SELECT") {
      const text = el.options[el.selectedIndex]?.text ?? "";
      // A native arrow sits inside the padding box; a drawn one in the padding.
      const arrow = cs.appearance === "none" ? 0 : 22;
      const room =
        el.clientWidth -
        parseFloat(cs.paddingLeft) -
        parseFloat(cs.paddingRight) -
        arrow;
      if (text && textWidth(text, el) > room + 1)
        out.push({ type: "select too narrow", el: name(el), text });
      continue;
    }
    if (el.tagName === "TEXTAREA") continue;
    if (
      cs.display.startsWith("inline") &&
      cs.display !== "inline-block" &&
      cs.display !== "inline-flex" &&
      cs.display !== "inline-grid"
    )
      continue;
    const hasText = [...el.childNodes].some(
      (n) => n.nodeType === 3 && n.textContent.trim(),
    );
    if (hasText && el.scrollWidth > el.clientWidth + 1 && el.clientWidth > 0)
      out.push({
        type: ["hidden", "clip"].includes(cs.overflowX)
          ? "text cut off"
          : "text spills out of its box",
        el: name(el),
        text: snippet(el),
      });
    if (
      hasText &&
      ["hidden", "clip"].includes(cs.overflowY) &&
      el.scrollHeight > el.clientHeight + 2
    )
      out.push({
        type: "text cut off (height)",
        el: name(el),
        text: snippet(el),
      });
    if (
      (cs.display.includes("flex") || cs.display.includes("grid")) &&
      el.children.length > 1 &&
      el.children.length < 16
    ) {
      const kids = [...el.children]
        .filter((k) => {
          const p = getComputedStyle(k).position;
          return (
            visible(k) &&
            p !== "absolute" &&
            p !== "fixed" &&
            k.getBoundingClientRect().width
          );
        })
        .map((k) => [k, k.getBoundingClientRect()]);
      for (let i = 0; i < kids.length; i++)
        for (let j = i + 1; j < kids.length; j++) {
          const [a, ra] = kids[i],
            [b, rb] = kids[j];
          const x = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
          const y = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
          if (x > 1 && y > 1)
            out.push({
              type: "items overlap",
              el: name(el),
              text: `${snippet(a)} ⟷ ${snippet(b)}`,
            });
        }
    }
  }
  for (const sel of equalGrids)
    for (const g of document.querySelectorAll(sel)) {
      if (!visible(g) || !getComputedStyle(g).display.includes("grid"))
        continue;
      const cols = getComputedStyle(g)
        .gridTemplateColumns.split(" ")
        .map(parseFloat)
        .filter(Boolean);
      if (cols.length > 1 && Math.max(...cols) - Math.min(...cols) > 2)
        out.push({
          type: "unequal columns",
          el: name(g),
          text: cols.map(Math.round).join(" / "),
        });
    }
  return out;
}

const browser = await chromium.launch();
const results = new Map();
async function run(context, label, path, setup) {
  const page = await context.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  const response = await page.goto(base + path, { waitUntil: "networkidle" });
  if (!response?.ok()) console.warn("!!", label, path, response?.status());
  await page.evaluate(() => document.fonts.ready);
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(
      () =>
        new Promise((r) =>
          requestAnimationFrame(() => requestAnimationFrame(r)),
        ),
    );
    if (setup) await setup(page, width);
    for (const issue of await page.evaluate(audit, { equalGrids })) {
      const key = `${label} ${path} | ${issue.type} | ${issue.el} | ${issue.text}`;
      results.set(key, [...(results.get(key) ?? []), width]);
    }
  }
  await page.close();
}
const openIf = (selector) => async (page) => {
  const toggle = page.locator(selector);
  if (
    (await toggle.isVisible()) &&
    (await toggle.getAttribute("aria-expanded")) === "false"
  )
    await toggle.click();
};

// Public pages, in each language and in their interactive states.
// Its own visitor address, so repeated runs stay under the inquiry limit.
const visitor = await browser.newContext({
  extraHTTPHeaders: { "x-forwarded-for": `audit-${Date.now()}` },
});
for (const lang of ["", "/ru", "/ka"]) {
  for (const path of [
    "/",
    "/dealers",
    "/calculator",
    "/cars",
    "/cars?sold=1",
    "/cars/1",
    "/cars/2",
    "/cars/3",
  ])
    await run(visitor, `public${lang || "/en"}`, lang + path);
  await run(
    visitor,
    `public${lang || "/en"} menu`,
    lang + "/",
    openIf(".menu-toggle"),
  );
  await run(
    visitor,
    `public${lang || "/en"} filters`,
    lang + "/cars",
    openIf(".filters-toggle"),
  );
  await run(visitor, `public${lang || "/en"} faq`, lang + "/", async (page) => {
    await page.evaluate(() =>
      document.querySelectorAll("details").forEach((d) => (d.open = true)),
    );
  });
  await run(
    visitor,
    `public${lang || "/en"} iaai`,
    lang + "/calculator",
    async (page) => {
      await page.locator("input[value=IAAI]").check({ force: true });
    },
  );
  await run(
    visitor,
    `public${lang || "/en"} prepared`,
    lang + "/",
    async (page) => {
      if (await page.locator(".prepared-result, .form-result").count()) return;
      await page.locator("input[name=name]").fill("Test");
      await page.locator("input[name=email]").fill("test@example.com");
      await page
        .locator("textarea[name=message]")
        .fill("A long enough message.");
      await page.locator(".form-submit").click();
    },
  );
  await run(
    visitor,
    `public${lang || "/en"} gallery`,
    lang + "/cars/1",
    async (page) => {
      if (!(await page.locator(".gallery-expand").count())) return; // no cars yet
      if (!(await page.locator(".gallery-dialog[open]").count()))
        await page.locator(".gallery-expand").click();
    },
  );
}

// Admin, in Georgian and English.
if (!publicOnly) {
  const signedOut = await browser.newContext();
  await run(signedOut, "admin/ka", "/admin/login");
  await run(signedOut, "admin/ka error", "/admin/login", async (page) => {
    if (await page.locator(".admin-error").count()) return;
    await page.locator("input[name=password]").fill("wrong");
    await page.locator("input[name=password]").press("Enter");
    await page.locator(".admin-error").waitFor();
  });
  for (const lang of ["ka", "en"]) {
    const admin = await browser.newContext();
    await admin.addCookies([{ name: "lh_admin_lang", value: lang, url: base }]);
    const login = await admin.newPage();
    await login.goto(base + "/admin/login");
    await login.locator("input[name=password]").fill(password);
    await login.locator("input[name=password]").press("Enter");
    await login.waitForURL(/\/admin\/cars$/);
    await login.close();
    for (const path of [
      "/admin/cars",
      "/admin/cars/new",
      "/admin/cars/1",
      "/admin/cars/2",
      "/admin/texts",
      "/admin/photos",
      "/admin/inquiries",
    ])
      await run(admin, `admin/${lang}`, path);
    // A replaced photo adds the focus point and description fields. The
    // upload is never saved; it stays in the local test data only.
    await run(admin, `admin/${lang} photo`, "/admin/photos", async (page) => {
      if (await page.locator(".focus-picker").count()) return;
      await page
        .locator(".site-photo input[type=file]")
        .first()
        .setInputFiles("public/images/vehicle-detail.jpg");
      await page.locator(".focus-picker").waitFor();
    });
    await run(
      admin,
      `admin/${lang} errors`,
      "/admin/cars/new",
      async (page) => {
        if (await page.locator(".field-error").count()) return;
        await page
          .locator("input[name=status][value=available]")
          .check({ force: true });
        await page.locator(".car-form button.button:visible").first().click();
        await page.locator(".field-error").first().waitFor();
      },
    );
  }
}
await browser.close();

const rows = [...results].map(
  ([key, w]) =>
    `${key} | at ${w.length === widths.length ? "all widths" : w.join(",")}`,
);
writeFileSync(".data/layout-audit.txt", rows.join("\n") + "\n");
console.log(rows.length ? rows.join("\n") : "No layout issues found.");
console.log(`\n${rows.length} issue(s).`);
