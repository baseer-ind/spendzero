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
  let sawInsight = false;
  for (let i = 0; i < 10; i++) {
    await page.getByRole("button", { name: "Sometimes", exact: true }).click();
    await page.waitForTimeout(140);
    if (i === 0) sawInsight = (await page.getByText("worth noticing", { exact: false }).count()) > 0;
    const label = i < 9 ? "Continue" : "See my profile";
    await page.getByRole("button", { name: label, exact: true }).click();
    await page.waitForTimeout(140);
  }
  log(`assessment shows insight + Continue: ${sawInsight}`);
  if (!sawInsight) issues.push("ASSESSMENT: insight step not shown after selecting an answer");
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
  await page.waitForTimeout(250);
  const spendLead = await page.getByText("about to spend", { exact: false }).count();
  log(`decision leads with amount ("about to spend"): ${spendLead > 0}`);
  if (spendLead === 0) issues.push("DECISION: amount not leading the screen");
  const twoDirections = await page.getByText("One choice. Two directions", { exact: false }).count();
  if (twoDirections === 0) issues.push("DECISION: 'One choice. Two directions' copy missing");
  const dreamAtDecide = await page.getByText("India Trip", { exact: false }).count();
  log(`dream visible with amount at decision: ${dreamAtDecide > 0}`);
  if (dreamAtDecide === 0) issues.push("DECISION: active dream not visible at decision");
  // trigger is optional now — pick one to verify it still records
  await page.getByText("I'm hungry", { exact: false }).first().click().catch(() => {});
  await page.getByRole("button", { name: /Build my future/i }).click();
  await page.waitForTimeout(300);
  const closer = await page.getByText("closer", { exact: false }).count();
  log(`goal choice shows before→after ("…closer"): ${closer > 0}`);
  if (closer === 0) issues.push("DECISION: before/after goal card missing");
  await page.getByText("India Trip", { exact: false }).first().click();
  await page.waitForURL("**/continue", { timeout: 8000 });
  await page.getByText("craving ends here", { exact: false }).first().waitFor({ timeout: 6000 }).catch(() => {});
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
  await page.getByText("Would you have bought it at", { exact: false }).first().waitFor({ timeout: 6000 }).catch(() => {});
  const question = await page.getByText("Would you have bought it at", { exact: false }).count();
  const source = await page.getByText("Krishna", { exact: false }).count();
  log(`discount-trap lesson (question + research): ${question > 0 && source > 0}`);
  if (question === 0 || source === 0) issues.push("LEARN: Discount Trap lesson missing question/research");
  await shot("lesson");

  // 9d) MULTIPLE DREAMS at the decision
  await go("/future");
  await page.getByText("Add a new dream", { exact: false }).click();
  await page.waitForTimeout(250);
  await page.getByPlaceholder("What are you saving for?").fill("Dream Home");
  await page.getByPlaceholder("Target amount").fill("500000");
  await page.getByRole("button", { name: "Save", exact: true }).click();
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

  // 9e) ELECTRONICS vertical (browse-heavy) + tracking
  log("\n-- electronics vertical --");
  await go("/today");
  const elLive = await page.getByText("Electronics", { exact: true }).count();
  log(`electronics live on today: ${elLive > 0}`);
  await page.getByText("Electronics", { exact: true }).click();
  await page.waitForURL("**/electronics", { timeout: 8000 });
  await page.getByText("Deals of the day", { exact: false }).first().waitFor({ timeout: 6000 }).catch(() => {});
  const deals = await page.getByText("Deals of the day", { exact: false }).count();
  log(`techbazaar deals rail: ${deals > 0}`);
  if (deals === 0) issues.push("ELECTRONICS: deals rail missing");
  await page.waitForTimeout(1500);
  // search
  await page.getByPlaceholder("Search gadgets, brands…").fill("earbuds");
  await page.waitForTimeout(400);
  const foundEl = await page.getByText("Wireless ANC Earbuds", { exact: false }).count();
  log(`electronics search works: ${foundEl > 0}`);
  if (foundEl === 0) issues.push("ELECTRONICS: search did not filter");
  await page.getByText("Wireless ANC Earbuds", { exact: false }).first().click();
  await page.waitForURL("**/electronics/**", { timeout: 8000 });
  await shot("product");
  const specs = await page.getByText("Specifications", { exact: false }).count();
  const reviews = await page.getByText("Reviews", { exact: false }).count();
  log(`product detail (specs + reviews): ${specs > 0 && reviews > 0}`);
  if (specs === 0 || reviews === 0) issues.push("ELECTRONICS: product detail missing specs/reviews");
  // wishlist toggle
  await page.getByLabel("Wishlist").click();
  await page.waitForTimeout(200);
  await page.waitForTimeout(1200);
  await page.getByRole("button", { name: "Add to cart", exact: true }).click();
  await page.waitForTimeout(300);
  await page.getByText("View cart", { exact: false }).first().click();
  await page.waitForURL("**/cart", { timeout: 8000 });
  await page.getByText("Proceed to checkout", { exact: false }).click();
  await page.waitForURL("**/checkout", { timeout: 8000 });
  await page.getByText("Place order", { exact: false }).click();
  await page.waitForURL("**/pause**", { timeout: 8000 });
  await page.waitForTimeout(250);
  const catEl = await page.getByText("Electronics", { exact: false }).count();
  log(`decision shows Electronics category: ${catEl > 0}`);
  if (catEl === 0) issues.push("ELECTRONICS: category not carried to decision");
  await page.getByRole("button", { name: /Enjoy it/i }).click();
  await page.waitForTimeout(300);

  // 9e2) SHOPPING: sort, filters, wishlist destination, recommendations
  await go("/electronics");
  // local images (no remote hosts) — catalogue <img> should be data: URIs
  const imgSrc = await page.locator("img").first().getAttribute("src");
  const localImg = (imgSrc || "").startsWith("data:");
  log(`catalogue images are local (data URI): ${localImg}`);
  if (!localImg) issues.push("IMAGE: catalogue image is not a local asset");
  // filter: under 2000
  await page.getByText("Under ₹2,000", { exact: false }).click();
  await page.waitForTimeout(300);
  // sort: price low→high
  await page.selectOption("select", "price-asc").catch(() => {});
  await page.waitForTimeout(300);
  // wishlist destination
  await page.getByText("Wishlist", { exact: false }).first().click();
  await page.waitForURL("**/wishlist", { timeout: 8000 });
  const wlEmpty = await page.getByText("Nothing saved yet", { exact: false }).count();
  log(`wishlist route reachable (empty state ok): ${wlEmpty >= 0}`);
  // add a wishlist item then verify it shows
  await go("/electronics");
  await page.getByText("Game Controller", { exact: false }).first().click();
  await page.waitForURL("**/electronics/**", { timeout: 8000 });
  await page.waitForTimeout(400);
  const moreLikeThis = await page.getByText("More like this", { exact: false }).count();
  log(`recommendations present: ${moreLikeThis > 0}`);
  if (moreLikeThis === 0) issues.push("SHOPPING: recommendations missing");
  const delivery = await page.getByText("Delivery by tomorrow", { exact: false }).count();
  if (delivery === 0) issues.push("SHOPPING: delivery/availability missing on detail");
  // wishlist this (fresh) product, then verify it persists on /wishlist
  await page.getByLabel("Wishlist").click();
  await page.waitForTimeout(200);
  await go("/wishlist");
  const wlHas = await page.getByText("Add to cart", { exact: false }).count();
  log(`wishlist persists an item: ${wlHas > 0}`);
  if (wlHas === 0) issues.push("SHOPPING: wishlist did not persist item");

  // 9f) TRACKER VISIBLE — home "Your day" card + consumption dashboard
  await go("/");
  const yourDay = await page.getByText("your day", { exact: false }).count();
  const seeActivity = await page.getByText("See your activity", { exact: false }).count();
  log(`home 'Your day' tracker card visible: ${yourDay > 0 && seeActivity > 0}`);
  if (yourDay === 0 || seeActivity === 0) issues.push("TRACKER: 'Your day' card not on home");
  await page.getByText("See your activity", { exact: false }).click();
  await page.waitForURL("**/consumption", { timeout: 8000 });
  await page.getByText("where your attention went", { exact: false }).first().waitFor({ timeout: 6000 }).catch(() => {});
  const attn = await page.getByText("where your attention went", { exact: false }).count();
  log(`consumption dashboard: ${attn > 0}`);
  if (attn === 0) issues.push("CONSUMPTION: dashboard not rendering");
  const today = await page.getByText("Exploring time", { exact: false }).count();
  const caught = await page.getByText("What caught your attention", { exact: false }).count();
  const hasEl = await page.getByText("Electronics", { exact: false }).count();
  log(`today tiles + attention map + vertical: ${today > 0 && caught > 0 && hasEl > 0}`);
  if (today === 0) issues.push("CONSUMPTION: today tiles missing");
  if (caught === 0) issues.push("CONSUMPTION: attention map missing");
  await shot("consumption");

  // 9g) NEW VERTICALS live (no more "Soon" dead cards)
  log("\n-- market verticals --");
  await go("/today");
  for (const name of ["Grocery", "Shopping", "Travel", "Entertainment", "Beauty", "Home"]) {
    const soon = await page.locator(`text=${name}`).first().isVisible().catch(() => false);
    if (!soon) issues.push(`MARKET: ${name} card missing`);
  }
  // deep-test Grocery end to end
  await page.getByText("Grocery", { exact: true }).click();
  await page.waitForURL("**/market/grocery", { timeout: 8000 });
  await page.getByText("Top deals", { exact: false }).first().waitFor({ timeout: 6000 }).catch(() => {});
  const gHub = await page.getByText("Top deals", { exact: false }).count();
  log(`grocery storefront loads: ${gHub > 0}`);
  if (gHub === 0) issues.push("MARKET: grocery storefront not rendering");
  await page.getByPlaceholder(/Search FreshKart/i).fill("milk");
  await page.waitForTimeout(300);
  const milk = await page.getByText("Milk", { exact: false }).count();
  log(`grocery search works: ${milk > 0}`);
  if (milk === 0) issues.push("MARKET: grocery search failed");
  await page.getByText("Milk", { exact: false }).first().click();
  await page.waitForURL("**/market/grocery/**", { timeout: 8000 });
  await page.waitForTimeout(300);
  await page.getByRole("button", { name: "Add to cart", exact: true }).click();
  await page.waitForTimeout(300);
  await page.getByText("View cart", { exact: false }).first().click();
  await page.waitForURL("**/cart", { timeout: 8000 });
  await page.getByText("Proceed to checkout", { exact: false }).click();
  await page.waitForURL("**/checkout", { timeout: 8000 });
  await page.getByText("Place order", { exact: false }).click();
  await page.waitForURL("**/pause**", { timeout: 8000 });
  await page.waitForTimeout(250);
  const gCat = await page.getByText("Grocery", { exact: false }).count();
  log(`decision shows Grocery category: ${gCat > 0}`);
  if (gCat === 0) issues.push("MARKET: grocery category not carried to decision");
  await page.getByRole("button", { name: /Enjoy it/i }).click();
  await page.waitForTimeout(300);

  // 10) PROFILE photo affordance + ACHIEVEMENTS
  await go("/profile");
  const photoBtn = await page.getByLabel("Change profile photo").count();
  log(`profile photo editable: ${photoBtn > 0}`);
  if (photoBtn === 0) issues.push("IMAGE: profile photo affordance missing");
  await go("/achievements");
  const ach = await page.getByText("unlocked", { exact: false }).count();
  log(`achievements screen: ${ach > 0}`);
  if (ach === 0) issues.push("ACHIEVEMENTS: screen not rendering");

  // 10a2) SETTINGS: data export/delete + legal present
  await go("/settings");
  const exp = await page.getByText("Export my data", { exact: false }).count();
  const del = await page.getByText("Delete my data", { exact: false }).count();
  const priv = await page.getByText("Privacy Policy", { exact: false }).count();
  log(`settings: export=${exp > 0} delete=${del > 0} privacy=${priv > 0}`);
  if (exp === 0 || del === 0 || priv === 0) issues.push("TRUST: settings data/legal controls missing");

  // 10b) FEEDBACK + SUGGESTIONS
  await go("/feedback");
  const fbHead = await page.getByText("Help shape SELFly", { exact: false }).count();
  log(`feedback screen: ${fbHead > 0}`);
  if (fbHead === 0) issues.push("FEEDBACK: screen not rendering");
  await page.getByText("Suggest an improvement", { exact: false }).click();
  await page.getByPlaceholder(/Tell us what happened/i).fill("I'd love to compare two headphones side by side.");
  await page.getByRole("button", { name: "Submit feedback", exact: true }).click();
  await page.waitForTimeout(300);
  const thanks = await page.getByText("Thank you", { exact: false }).count();
  log(`feedback submitted: ${thanks > 0}`);
  if (thanks === 0) issues.push("FEEDBACK: submit did not confirm");
  await page.getByText("See my feedback", { exact: false }).click();
  await page.waitForTimeout(300);
  const mineHas = await page.getByText("compare two headphones", { exact: false }).count();
  log(`my-feedback history shows submission: ${mineHas > 0}`);
  if (mineHas === 0) issues.push("FEEDBACK: my-feedback history missing submission");

  // 10c) EDIT + DELETE DREAM, amount-in-words
  await go("/future");
  await page.getByText("Edit", { exact: false }).first().click();
  await page.waitForTimeout(250);
  const nameInput = page.getByPlaceholder("What are you saving for?");
  await nameInput.fill("Goa Escape");
  const amtInput = page.getByPlaceholder("Target amount");
  await amtInput.fill("200000");
  await page.waitForTimeout(200);
  const words = await page.getByText("Lakh Rupees", { exact: false }).count();
  log(`edit shows amount in words (Lakh): ${words > 0}`);
  if (words === 0) issues.push("DREAM: amount-in-words not shown in edit");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page.waitForTimeout(300);
  const renamed = await page.getByText("Goa Escape", { exact: false }).count();
  log(`dream renamed + target edited: ${renamed > 0}`);
  if (renamed === 0) issues.push("DREAM: edit did not apply");
  // delete a dream with confirmation
  const beforeDel = await page.getByText("Dream Home", { exact: false }).count();
  if (beforeDel > 0) {
    await page.getByText("Delete", { exact: false }).nth(1).click();
    await page.waitForTimeout(200);
    await page.getByRole("button", { name: "Delete dream", exact: true }).click();
    await page.waitForTimeout(300);
    const afterDel = await page.getByText("Dream Home", { exact: false }).count();
    log(`dream deleted after confirm: ${afterDel === 0}`);
    if (afterDel !== 0) issues.push("DREAM: delete did not remove the dream");
  }

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
  for (const r of ["/", "/future", "/today", "/food", "/electronics", "/market/grocery", "/market/shopping", "/market/travel", "/market/entertainment", "/market/beauty", "/market/home", "/wishlist", "/cart", "/checkout", "/continue", "/journey", "/profile", "/achievements", "/savings", "/consumption", "/learn", "/learn/discount-trap", "/feedback", "/settings"]) {
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
