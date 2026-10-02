import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const EXE = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const BASE = "http://127.0.0.1:3000";
const OUT = "/tmp/claude-0/-home-user-spendzero/35759831-7592-5bcd-9f72-dd5e51cf19f4/scratchpad/shots";
mkdirSync(OUT, { recursive: true });

const issues = [];
const log = (...a) => console.log(...a);
const browser = await chromium.launch({ executablePath: EXE, headless: true });
const ctx = await browser.newContext({ viewport: { width: 420, height: 880 } });
const page = await ctx.newPage();
const consoleErrors = [];
page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
page.on("pageerror", (e) => issues.push(`PAGEERROR: ${e.message}`));

const shot = (n) => page.screenshot({ path: `${OUT}_${n}.png` });
async function go(path) {
  const res = await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 20000 });
  if (!res || res.status() >= 400) issues.push(`ROUTE ${path} -> ${res ? res.status() : "none"}`);
  return res ? res.status() : 0;
}

try {
  // 1) STORY
  await go("/");
  const story = await page.getByText("Skip", { exact: false }).count();
  log(`story shown: ${story > 0}`);
  if (story === 0) issues.push("STORY: not shown on first launch");
  await shot("story");
  await page.getByText("Skip", { exact: false }).first().click();
  await page.waitForTimeout(400);

  // 2) REGISTER
  const auth = await page.getByText("Create my account", { exact: false }).count();
  log(`auth shown after story: ${auth > 0}`);
  if (auth === 0) issues.push("AUTH: not shown after story");
  await page.getByPlaceholder("Aarav").fill("Test User");
  await page.getByPlaceholder("you@email.com").fill("test@future.app");
  await page.getByPlaceholder("At least 6 characters").fill("secret123");
  await page.getByText("Create my account", { exact: true }).click();
  await page.waitForTimeout(600);

  // 3) ASSESSMENT (10 questions)
  const assess = await page.getByText("A quick read", { exact: false }).count();
  log(`assessment shown after register: ${assess > 0}`);
  if (assess === 0) issues.push("ASSESSMENT: not shown after register");
  for (let i = 0; i < 10; i++) {
    await page.getByRole("button", { name: "Sometimes", exact: true }).click();
    await page.waitForTimeout(180);
  }
  await page.waitForTimeout(300);

  // 4) PROFILE RESULT
  const prof = await page.getByText("Your pattern", { exact: false }).count();
  log(`profile result shown: ${prof > 0}`);
  if (prof === 0) issues.push("PROFILE: result not shown after assessment");
  await shot("profile");
  await page.getByText("what are we building", { exact: false }).click();
  await page.waitForTimeout(400);

  // 5) FIRST GOAL
  const goal = await page.getByText("feel worth it", { exact: false }).count();
  log(`first-goal shown: ${goal > 0}`);
  if (goal === 0) issues.push("GOAL: first-goal step not shown");
  await page.getByText("Travel", { exact: false }).first().click();
  await page.waitForTimeout(300);
  await page.getByText("Start building this", { exact: false }).click();
  await page.waitForTimeout(600);
  await shot("home");

  // 6) IN APP — home
  const inApp = await page.getByText("Today", { exact: false }).count();
  log(`landed in app (bottom nav): ${inApp > 0}`);
  if (inApp === 0) issues.push("APP: did not land in app after goal");

  // 7) QUICK RESIST → PAUSE → NOT TODAY → CONTINUE
  await go("/order");
  await page.getByText("Move to my future", { exact: false }).first().click();
  await page.waitForURL("**/pause**", { timeout: 8000 });
  log("order → pause: true");
  await page.getByText("I'm bored", { exact: false }).click();
  await page.waitForTimeout(200);
  await page.getByText("build my future", { exact: false }).click();
  await page.waitForURL("**/continue", { timeout: 8000 });
  log("pause (not today) → continue: true");
  await shot("continue");

  // 8) PAUSE → BUY PATH (enjoy it)
  await go("/order");
  await page.getByText("Move to my future", { exact: false }).first().click();
  await page.waitForURL("**/pause**", { timeout: 8000 });
  await page.getByText("genuinely want it", { exact: false }).first().click();
  await page.waitForTimeout(200);
  await page.getByText("Yes — I genuinely want it", { exact: false }).click();
  await page.waitForTimeout(400);
  const enjoy = await page.getByText("Enjoy it", { exact: false }).count();
  log(`buy path → "Enjoy it": ${enjoy > 0}`);
  if (enjoy === 0) issues.push("PAUSE: buy path did not reach Enjoy it");

  // 9) CART FLOW → PAUSE
  await go("/restaurant");
  await page.getByRole("button", { name: "Add", exact: true }).first().click();
  await page.waitForTimeout(300);
  await page.getByText("Review", { exact: false }).first().click();
  await page.waitForURL("**/cart", { timeout: 8000 });
  await page.getByText("Take a moment", { exact: false }).click();
  await page.waitForURL("**/pause**", { timeout: 8000 });
  log("cart → pause: true");

  // 10) ACHIEVEMENTS
  await go("/achievements");
  const ach = await page.getByText("unlocked", { exact: false }).count();
  log(`achievements screen: ${ach > 0}`);
  if (ach === 0) issues.push("ACHIEVEMENTS: screen not rendering");

  // 11) persistence after reload
  await go("/");
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  const stillIn = await page.getByText("Today", { exact: false }).count();
  log(`still logged in + onboarded after reload: ${stillIn > 0}`);
  if (stillIn === 0) issues.push("PERSISTENCE: reset onboarding/session after reload");

  // 12) all routes 200
  for (const r of ["/", "/future", "/order", "/restaurants", "/restaurant", "/cart", "/continue", "/journey", "/profile", "/achievements"]) {
    const s = await go(r);
    if (s !== 200) log(`route ${r}: ${s}`);
  }
} catch (e) {
  issues.push(`FLOW EXCEPTION: ${e.message}`);
}

log("\n==== CONSOLE ERRORS ====");
for (const e of [...new Set(consoleErrors)]) log("  • " + e);
log("\n==== ISSUES ====");
if (issues.length === 0) log("  ✅ none");
for (const e of issues) log("  ✗ " + e);

await browser.close();
