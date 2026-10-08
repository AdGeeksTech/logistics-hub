import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3001",
    headless: true,
  },
  reporter: "list",
  // The admin tests publish changes and then check the public pages, so
  // they run after the other tests: a page built by another test at the
  // moment of publishing could otherwise show the old version.
  projects: [
    { name: "site", testIgnore: /admin\.spec\.ts/ },
    { name: "admin", testMatch: /admin\.spec\.ts/, dependencies: ["site"] },
  ],
});
