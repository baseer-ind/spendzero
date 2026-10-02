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

  // 3) ASSESSMENT
  const assess = await page.getByText("A quick read", { exact: false }).count();
  log(`assessment shown after register: ${assess > 0}`);
  if (assess === 0) issues.push("ASSESSMENT: not shown after register");
  for (let i = 0; i < 10; i++) {
    await page.getByRole("button", { name: "Sometimes", exact: true }).click();
    await page.waitForTimeout(160);
  }
  await page.waitForTimeout(300);

  // 4) PROFILE RESULT
  const prof = await page.getByText("Your pattern", { exact: false }).count();
  log(`profile result shown: ${prof > 0}`);
  if (prof === 0) issues.push("PROFILE: result not shown after assessment");
  await page.getByText("what are we building", { exact: false }).click();
  await page.waitForTimeout(400);

  // 5) FIRST GOAL (India-first category)
  const goal = await page.getByText("feel worth it", { exact: false }).count();
  log(`first-goal shown: ${goal > 0}`);
  if (goal === 0) issues.push("GOAL: first-goal step not shown");
  await page.getByText("India Trip", { exact: false }).first().click();
  await page.waitForTimeout(300);
  const coverBtn = await page.getByText("Add a cover", { exact: false }).count();
  log(`cover picker offered on first goal: ${coverBtn > 0}`);
  if (coverBtn === 0) issues.push("IMAGE: cover picker not offered on first goal");
  await page.getByText("Start building this", { exact: false }).click();
  await page.waitForTimeout(600);

  // 5b) POST-GOAL TRANSITION
  const trans = await page.getByText("your future has a name", { exact: false }).count();
  log(`post-goal transition shown: ${trans > 0}`);
  if (trans === 0) issues.push("TRANSITION: post-goal screen not shown");
  await page.getByText("Explore today", { exact: false }).click();
  await page.waitForURL("**/today", { timeout: 8000 });

  // 6) TODAY HUB → FOOD deep flow (India-first)
  log("\n-- food vertical (India-first) --");
  const mood = await page.getByText("in the mood for", { exact: false }).count();
  log(`today hub shown: ${mood > 0}`);
  await page.getByText("Food", { exact: true }).click();
  await page.waitForURL("**/food", { timeout: 8000 });
  await page.getByText("ZaikaGo", { exact: false }).first().click();
  await page.waitForURL("**/food/zaikago", { timeout: 8000 });
  // search for an Indian dish
  await page.getByPlaceholder("Search restaurants or dishes…").fill("biryani");
  await page.waitForTimeout(300);
  const found = await page.getByText("Deccan Zaika", { exact: false }).count();
  log(`search 'biryani' finds Deccan Zaika: ${found > 0}`);
  if (found === 0) issues.push("FOOD: search did not filter to biryani restaurant");
  await page.getByText("Deccan Zaika", { exact: false }).first().click();
  await page.waitForURL("**/food/zaikago/**", { timeout: 8000 });
  await shot("menu");
  const menu = await page.getByText("Menu", { exact: false }).count();
  log(`restaurant menu shown: ${menu > 0}`);
  await page.getByRole("button", { name: "ADD", exact: true }).first().click();
  await page.waitForTimeout(400);
  // bestseller biryani has add-ons → DishSheet
  const sheet = await page.getByRole("button", { name: /Add to cart/i }).count();
  if (sheet > 0) {
    log("dish detail sheet opened (add-ons): true");
    await page.getByRole("button", { name: /Add to cart/i }).click();
    await page.waitForTimeout(400);
  }
  await page.getByText("View cart", { exact: false }).click();
  await page.waitForURL("**/cart", { timeout: 8000 });
  await page.waitForTimeout(400);
  const cartItem = await page.getByText("Biryani", { exact: false }).count();
  log(`cart has item from food flow: ${cartItem > 0}`);
  if (cartItem === 0) issues.push("FOOD: item not in cart");

  // 7) CHECKOUT (Indian address + payment) → PAUSE
  await page.getByText("Proceed to checkout", { exact: false }).click();
  await page.waitForURL("**/checkout", { timeout: 8000 });
  await shot("checkout");
  const addr = await page.getByPlaceholder("Flat / House no / Building").count();
  log(`checkout address form shown: ${addr > 0}`);
  if (addr === 0) issues.push("CHECKOUT: Indian address form not shown");
  await page.getByPlaceholder("Full name").fill("Test User");
  await page.getByPlaceholder("Mobile number").fill("9876543210");
  await page.getByPlaceholder("Flat / House no / Building").fill("Flat 302, Lotus Residency");
  await page.getByPlaceholder("Area / Street / Sector").fill("Road No 12, Banjara Hills");
  await page.getByPlaceholder("PIN Code").fill("500034");
  await page.getByText("Save address", { exact: false }).click();
  await page.waitForTimeout(300);
  const upi = await page.getByText("UPI", { exact: false }).count();
  log(`payment methods (UPI etc) shown: ${upi > 0}`);
  if (upi === 0) issues.push("CHECKOUT: payment methods not shown");
  await page.getByText("Place order", { exact: false }).click();
  await page.waitForURL("**/pause**", { timeout: 8000 });
  log("cart → checkout → place order → pause: true");

  // 8) DECISION MOMENT → BUILD MY FUTURE → CONTINUE
  await page.getByText("I'm hungry", { exact: false }).click();
  await page.waitForTimeout(250);
  const futureWaiting = await page.getByText("Your future is waiting", { exact: false }).count();
  log(`decision moment shows dreams ("future is waiting"): ${futureWaiting > 0}`);
  if (futureWaiting === 0) issues.push("DECISION: dreams not shown at the decision moment");
  const twoDirections = await page.getByText("One choice. Two directions", { exact: false }).count();
  if (twoDirections === 0) issues.push("DECISION: 'One choice. Two directions' copy missing");
  const dreamAtDecide = await page.getByText("India Trip", { exact: false }).count();
  log(`dream visible with amount at decision: ${dreamAtDecide > 0}`);
  if (dreamAtDecide === 0) issues.push("DECISION: active dream not visible at decision");
  await page.getByRole("button", { name: /Build my future/i }).click();
  await page.waitForTimeout(300);
  // choose step: before→after goal card
  const closer = await page.getByText("closer", { exact: false }).count();
  log(`goal choice shows before→after ("…closer"): ${closer > 0}`);
  if (closer === 0) issues.push("DECISION: before/after goal card missing");
  await page.getByText("India Trip", { exact: false }).first().click();
  await page.waitForURL("**/continue", { timeout: 8000 });
  const cravingEnds = await page.getByText("craving ends here", { exact: false }).count();
  log(`continue screen ("craving ends here"): ${cravingEnds > 0}`);
  await shot("continue");

  // 9) BUY PATH (enjoy it) — go through food again quickly
  await go("/food/zaikago/udupi-grand");
  await page.getByRole("button", { name: "ADD", exact: true }).first().click();
  await page.waitForTimeout(300);
  const sheet2 = await page.getByRole("button", { name: /Add to cart/i }).count();
  if (sheet2 > 0) { await page.getByRole("button", { name: /Add to cart/i }).click(); await page.waitForTimeout(300); }
  await page.getByText("View cart", { exact: false }).click();
  await page.waitForURL("**/cart", { timeout: 8000 });
  await page.getByText("Proceed to checkout", { exact: false }).click();
  await page.waitForURL("**/checkout", { timeout: 8000 });
  // address is remembered now
  await page.getByText("Place order", { exact: false }).click();
  await page.waitForURL("**/pause**", { timeout: 8000 });
  await page.getByText("I genuinely want it", { exact: false }).first().click();
  await page.waitForTimeout(250);
  await page.getByRole("button", { name: /Enjoy it/i }).click();
  await page.waitForTimeout(400);
  const enjoy = await page.getByText("You made the choice consciously", { exact: false }).count();
  log(`buy path → "Enjoy it": ${enjoy > 0}`);
  if (enjoy === 0) issues.push("PAUSE: buy path did not reach Enjoy it");

  // 9b) MONEY YOU KEPT
  await go("/savings");
  const kept = await page.getByText("redirected so far", { exact: false }).count();
  const catFood = await page.getByText("Food", { exact: false }).count();
  log(`money-you-kept screen + category breakdown: ${kept > 0 && catFood > 0}`);
  if (kept === 0) issues.push("SAVINGS: Money You Kept screen not rendering");

  // 9c) FUTURE INTELLIGENCE
  await go("/learn");
  const fi = await page.getByText("How spending decisions", { exact: false }).count();
  log(`future intelligence hub: ${fi > 0}`);
  if (fi === 0) issues.push("LEARN: hub not rendering");
  await page.getByText("The Discount Trap", { exact: false }).first().click();
  await page.waitForURL("**/learn/discount-trap", { timeout: 8000 });
  const question = await page.getByText("Would you have bought it at", { exact: false }).count();
  const source = await page.getByText("Krishna", { exact: false }).count();
  log(`discount-trap lesson (question + research): ${question > 0 && source > 0}`);
  if (question === 0 || source === 0) issues.push("LEARN: Discount Trap lesson missing question/research");
  await shot("lesson");

  // 9d) MULTIPLE DREAMS at the decision
  await go("/future");
  await page.getByText("Add a new dream", { exact: false }).click();
  await page.waitForTimeout(200);
  await page.getByPlaceholder("What are you saving for?").fill("Dream Home");
  await page.getByPlaceholder("Target amount (₹)").fill("500000");
  await page.getByText("Create dream", { exact: false }).click();
  await page.waitForTimeout(400);
  await go("/food/zaikago/deccan-zaika");
  await page.getByRole("button", { name: "ADD", exact: true }).first().click();
  await page.waitForTimeout(300);
  const sheet3 = await page.getByRole("button", { name: /Add to cart/i }).count();
  if (sheet3 > 0) { await page.getByRole("button", { name: /Add to cart/i }).click(); await page.waitForTimeout(300); }
  await page.getByText("View cart", { exact: false }).click();
  await page.waitForURL("**/cart", { timeout: 8000 });
  await page.getByText("Proceed to checkout", { exact: false }).click();
  await page.waitForURL("**/checkout", { timeout: 8000 });
  await page.getByText("Place order", { exact: false }).click();
  await page.waitForURL("**/pause**", { timeout: 8000 });
  await page.getByText("I'm bored", { exact: false }).click();
  await page.waitForTimeout(250);
  const hasTrip = await page.getByText("India Trip", { exact: false }).count();
  const hasHome = await page.getByText("Dream Home", { exact: false }).count();
  log(`both dreams shown at decision: trip=${hasTrip > 0} home=${hasHome > 0}`);
  if (hasTrip === 0 || hasHome === 0) issues.push("DECISION: not all dreams shown with multiple goals");
  await page.getByRole("button", { name: /Build my future/i }).click();
  await page.waitForTimeout(300);
  // choose the second goal specifically
  await page.getByText("Dream Home", { exact: false }).first().click();
  await page.waitForURL("**/continue", { timeout: 8000 });
  const movedHome = await page.getByText("Dream Home", { exact: false }).count();
  log(`redirect routed to chosen goal (Dream Home): ${movedHome > 0}`);
  if (movedHome === 0) issues.push("DECISION: redirect did not route to the chosen goal");

  // 10) PROFILE photo affordance + ACHIEVEMENTS
  await go("/profile");
  const photoBtn = await page.getByLabel("Change profile photo").count();
  log(`profile photo editable: ${photoBtn > 0}`);
  if (photoBtn === 0) issues.push("IMAGE: profile photo affordance missing");
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

  // 12) address persistence after reload
  await go("/future");
  await go("/today");
  await page.getByText("Food", { exact: true }).click();
  await page.waitForURL("**/food", { timeout: 8000 });

  // 13) all live routes 200
  for (const r of ["/", "/future", "/today", "/food", "/cart", "/checkout", "/continue", "/journey", "/profile", "/achievements", "/savings", "/learn", "/learn/discount-trap"]) {
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
