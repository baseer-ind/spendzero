import { chromium } from "playwright-core";

const EXE = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const BASE = "http://127.0.0.1:3000";
const OUT = "/tmp/claude-0/-home-user-spendzero/35759831-7592-5bcd-9f72-dd5e51cf19f4/scratchpad/shots";

import { mkdirSync } from "node:fs";
mkdirSync(OUT, { recursive: true });

const issues = [];
const log = (...a) => console.log(...a);

const browser = await chromium.launch({ executablePath: EXE, headless: true });
const ctx = await browser.newContext({ viewport: { width: 420, height: 880 } });
const page = await ctx.newPage();

const consoleErrors = [];
page.on("console", (m) => {
  if (m.type() === "error") consoleErrors.push(m.text());
});
page.on("pageerror", (e) => issues.push(`PAGEERROR: ${e.message}`));

async function go(path) {
  const res = await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 20000 });
  const status = res ? res.status() : "no-response";
  if (!res || res.status() >= 400) issues.push(`ROUTE ${path} -> HTTP ${status}`);
  return status;
}

// 0. Registration gate
log("-- registration --");
await go("/");
await page.screenshot({ path: `${OUT}_auth.png` });
const sawAuth = await page.getByText("Create my account", { exact: false }).count();
log(`auth screen shown on first visit: ${sawAuth > 0}`);
if (sawAuth === 0) issues.push("AUTH: registration screen not shown on first visit");
try {
  await page.getByPlaceholder("Aarav").fill("Test User");
  await page.getByPlaceholder("you@email.com").fill("test@future.app");
  await page.getByPlaceholder("At least 6 characters").fill("secret123");
  await page.getByText("Create my account", { exact: true }).click();
  await page.waitForTimeout(800);
  const intoApp = await page.getByText("Set your first dream", { exact: false }).count();
  log(`registered -> landed in app: ${intoApp > 0}`);
  if (intoApp === 0) issues.push("AUTH: after registration did not land on app home/setup");
} catch (e) {
  issues.push(`REGISTER failed: ${e.message}`);
}

// 1. Routes load (now authed)
for (const r of ["/", "/future", "/order", "/continue", "/journey", "/profile", "/restaurants", "/restaurant", "/cart"]) {
  const s = await go(r);
  log(`route ${r}: ${s}`);
  await page.screenshot({ path: `${OUT}${r.replace(/\//g, "_") || "_home"}.png` });
}

// 2. Core loop: add a dream
await go("/future");
log("\n-- add dream flow --");
try {
  // open add form
  const addBtn = page.getByText("Add a new dream", { exact: false }).first();
  await addBtn.click({ timeout: 5000 });
  await page.getByPlaceholder("What are you saving for?").fill("Goa Trip");
  await page.getByPlaceholder("Target amount (₹)").fill("50000");
  await page.getByText("Create dream", { exact: true }).click();
  await page.waitForTimeout(600);
  const hasDream = await page.getByText("Goa Trip").count();
  log(`dream created & visible: ${hasDream > 0}`);
  if (hasDream === 0) issues.push("ADD DREAM: created dream not visible on /future");
} catch (e) {
  issues.push(`ADD DREAM failed: ${e.message}`);
}
await page.screenshot({ path: `${OUT}_future_after_add.png` });

// 3. persistence: reload, dream still there
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(500);
const persisted = await page.getByText("Goa Trip").count();
log(`dream persisted after reload: ${persisted > 0}`);
if (persisted === 0) issues.push("PERSISTENCE: dream gone after reload");

// 4. home shows active dream
await go("/");
await page.waitForTimeout(500);
const homeHasDream = await page.getByText("Goa Trip").count();
log(`home shows active dream: ${homeHasDream > 0}`);
if (homeHasDream === 0) issues.push("HOME: active dream not shown after creating one");
await page.screenshot({ path: `${OUT}_home_with_dream.png` });

// 5. skip craving -> money moves
await go("/order");
log("\n-- skip craving flow --");
try {
  await page.getByText("Move to my future", { exact: false }).first().click();
  await page.waitForURL("**/continue", { timeout: 8000 });
  await page.waitForTimeout(500);
  const bodyText = await page.textContent("body");
  const moved = /\+\s*₹/.test(bodyText || "");
  log(`continue shows amount moved: ${moved}`);
  if (!moved) issues.push("SKIP CRAVING: continue screen did not show amount moved");
} catch (e) {
  issues.push(`SKIP CRAVING failed: ${e.message}`);
}
await page.screenshot({ path: `${OUT}_continue.png` });

// 6. home reflects saved progress
await go("/");
await page.waitForTimeout(500);
const bodyHome = (await page.textContent("body")) || "";
const hasSaved = /saved/.test(bodyHome);
log(`home reflects saved: ${hasSaved}`);

log("\n==== CONSOLE ERRORS ====");
for (const e of [...new Set(consoleErrors)]) log("  • " + e);
log("\n==== ISSUES ====");
if (issues.length === 0) log("  (none found by smoke test)");
for (const e of issues) log("  ✗ " + e);

await browser.close();
