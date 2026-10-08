import { test, expect } from "@playwright/test";
import { readFileSync, readdirSync } from "node:fs";
import * as cars from "../lib/cars";
import { sorts } from "../lib/car-filters";
import { sitePhotoSlots } from "../lib/site-photo-slots";
import { textSections } from "../lib/text-catalog";
import ru from "../lib/i18n/ru.json" with { type: "json" };
import ka from "../lib/i18n/ka.json" with { type: "json" };

// Every site text: literal t("…") calls in components plus listing labels.
function usedKeys() {
  const keys = new Set<string>();
  const literal = /\bt\(\s*"((?:[^"\\]|\\.)*)"\s*,?\s*\)/g;
  const ternary =
    /\bt\(\s*[^()"]*\?\s*"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)"\s*,?\s*\)/g;
  // The preview banner is part of the admin and uses the admin dictionary.
  const files = readdirSync("components").filter(
    (f) => f.endsWith(".tsx") && f !== "preview-banner.tsx",
  );
  for (const file of files) {
    const source = readFileSync(`components/${file}`, "utf8");
    for (const m of source.matchAll(literal)) keys.add(JSON.parse(`"${m[1]}"`));
    for (const m of source.matchAll(ternary)) {
      keys.add(JSON.parse(`"${m[1]}"`));
      keys.add(JSON.parse(`"${m[2]}"`));
    }
  }
  const groups = [
    cars.statuses,
    cars.bodyTypes,
    cars.conditions,
    cars.fuelTypes,
    cars.gearboxes,
    cars.drives,
    cars.steeringSides,
    cars.colors,
    cars.interiorMaterials,
    cars.locations,
    cars.priceTermsOptions,
    sorts,
    ...Object.values(cars.featureGroups),
  ];
  for (const group of groups)
    for (const label of Object.values(group)) keys.add(label);
  for (const group of Object.keys(cars.featureGroups)) keys.add(group);
  for (const label of cars.specLabels) keys.add(label);
  for (const slot of Object.values(sitePhotoSlots)) keys.add(slot.altKey);
  return keys;
}

test("every site text used in components is translated", () => {
  const missing = [...usedKeys()].filter((key) => !(key in ru) || !(key in ka));
  expect(missing).toEqual([]);
});

test("the text editor lists every translated text exactly once", () => {
  const listed = textSections.flatMap((s) => s.keys);
  expect(listed.length).toBe(new Set(listed).size);
  expect([...listed].sort()).toEqual(Object.keys(ru).sort());
});
