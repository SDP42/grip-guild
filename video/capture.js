// Films the live deployed prototype frame by frame for the pitch video.
// Usage: node capture.js [scene ...]   (frames → frames/<scene>/0001.jpg)
const { chromium } = require("playwright-core");
const fs = require("fs");
const path = require("path");

const SITE = process.env.SITE || "https://gripguild-outliers.vercel.app";
const API = "https://grip-guild-api.onrender.com";
const OUT = path.join(__dirname, "frames");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const only = process.argv.slice(2);

let browser;
async function page() {
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  await ctx.addInitScript(() => { try { sessionStorage.setItem("gg-ignition", "1"); } catch {} });
  return ctx.newPage();
}
function recorder(name) {
  const dir = path.join(OUT, name);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  let n = 0;
  return async (p, times = 1) => {
    const buf = await p.screenshot({ type: "jpeg", quality: 88 });
    for (let i = 0; i < times; i++) fs.writeFileSync(path.join(dir, String(++n).padStart(4, "0") + ".jpg"), buf);
  };
}
const go = async (p, url, wait = 4500) => { await p.goto(SITE + url, { waitUntil: "networkidle", timeout: 120000 }); await p.waitForTimeout(wait); };
const film = async (p, shot, frames, gap = 40) => { for (let i = 0; i < frames; i++) { await shot(p); await p.waitForTimeout(gap); } };
const clickText = (p, text) => p.getByText(text, { exact: false }).first().click();

const scenes = {
  // 3D hero: wheel-scroll through the pinned hero so the tyre spins up and the camera dives through the hub
  async hero() {
    const p = await page(); const shot = recorder("hero");
    await go(p, "/", 6000);
    await p.mouse.move(1300, 500);
    await film(p, shot, 14, 30);
    for (let i = 0; i < 95; i++) { await p.mouse.wheel(0, 38); await p.waitForTimeout(25); await shot(p); }
    await film(p, shot, 10, 30);
    await p.close();
  },
  async twinScroll() {
    const p = await page(); const shot = recorder("twinScroll");
    await go(p, "/", 4000);
    const top = await p.evaluate(() => { const s = [...document.querySelectorAll("section")].find((x) => x.textContent.includes("gets a")); return s.getBoundingClientRect().top + scrollY; });
    await p.evaluate((y) => window.scrollTo(0, y), top);
    await p.waitForTimeout(2500);
    for (let i = 0; i < 80; i++) { await p.mouse.wheel(0, 30); await p.waitForTimeout(25); await shot(p); }
    await p.close();
  },
  async personas() {
    const p = await page(); const shot = recorder("personas");
    await go(p, "/personas", 3500);
    await p.mouse.wheel(0, 330); await p.waitForTimeout(2500);
    await shot(p);
    await p.mouse.move(470, 420); await p.waitForTimeout(600); await shot(p);
    await p.close();
  },
  async ravi() {
    const p = await page(); const shot = recorder("ravi");
    await go(p, "/app?persona=ravi", 7000);
    await shot(p);
    await p.close();
  },
  async scan() {
    const p = await page(); const shot = recorder("scan");
    await go(p, "/app/scan?persona=ravi", 5000);
    await shot(p);
    await clickText(p, "Simulate a QR scan");
    await film(p, shot, 40, 50);
    await clickText(p, "fraud test");
    await film(p, shot, 30, 50);
    await p.close();
  },
  // Rider ⇄ mechanic live SOS, filmed from both sides
  async sos() {
    const rider = await page(); const mech = await page();
    const shotR = recorder("sosRider"); const shotM = recorder("sosMech");
    await go(rider, "/rider", 4000);
    await shotR(rider);
    await clickText(rider, "I have a flat tyre");
    await film(rider, shotR, 30, 60);
    await clickText(rider, "Send SOS to");
    await rider.waitForTimeout(1500); await shotR(rider);
    await go(mech, "/app?persona=ravi", 7000); await shotM(mech);
    await go(mech, "/app/inbox?persona=ravi", 4000); await shotM(mech);
    await clickText(mech, "Accept & send ETA"); await mech.waitForTimeout(1500); await shotM(mech);
    await rider.waitForTimeout(4000); await shotR(rider);
    await rider.close(); await mech.close();
  },
  async shelf() {
    const p = await page(); const dealer = await page();
    const shot = recorder("shelf"); const shotD = recorder("dealer");
    await go(p, "/app/shelf?persona=ravi", 3000);
    await p.getByRole("button", { name: "Order", exact: true }).first().waitFor({ timeout: 60000 }); await p.waitForTimeout(1500); await shot(p);
    await p.getByRole("button", { name: "Order", exact: true }).first().click(); await p.waitForTimeout(2500); await shot(p);
    await go(dealer, "/dealer", 7000); await shotD(dealer);
    await dealer.getByRole("button", { name: /placed/ }).first().click(); await dealer.waitForTimeout(2000); await shotD(dealer);
    await p.waitForTimeout(5000); await shot(p);
    await go(p, "/app/refer?persona=ravi", 4000);
    await clickText(p, "Generate referral code"); await p.waitForTimeout(2500); await shot(p);
    await p.close(); await dealer.close();
  },
  async twin() {
    const p = await page(); const shot = recorder("twin");
    await go(p, "/twin", 3000);
    await p.getByText("Genuine Eurogrip tyre").waitFor({ timeout: 60000 });
    await p.waitForTimeout(6000);
    await film(p, shot, 8, 60);
    const box = await p.locator('input[type="range"]').first().boundingBox();
    const y = box.y + box.height / 2;
    await p.mouse.move(box.x + 2, y); await p.mouse.down();
    for (let i = 0; i <= 45; i++) { await p.mouse.move(box.x + 2 + (box.width - 4) * (i / 45), y); await p.waitForTimeout(20); await shot(p); }
    await p.mouse.up();
    await film(p, shot, 20, 60);
    await p.close();
  },
  async command() {
    const p = await page(); const shot = recorder("command");
    await go(p, "/command", 9000); await shot(p);
    await p.mouse.wheel(0, 640); await p.waitForTimeout(3500); await shot(p);
    await p.close();
  },
  async simulator() {
    const p = await page(); const shot = recorder("simulator");
    await go(p, "/simulator", 6000);
    const box = await p.locator('input[type="range"]').first().boundingBox();
    const y = box.y + box.height / 2;
    await p.mouse.move(box.x + box.width * 0.36, y); await p.mouse.down();
    for (let i = 0; i <= 30; i++) { await p.mouse.move(box.x + box.width * (0.36 + 0.5 * i / 30), y); await p.waitForTimeout(90); await shot(p); }
    await p.mouse.up(); await film(p, shot, 8, 80);
    await p.close();
  },
  async bot() {
    const p = await page(); const shot = recorder("bot");
    await go(p, "/app/bot?persona=ravi", 6000); await shot(p);
    await p.getByPlaceholder("Message").fill("refer a rider"); await p.keyboard.press("Enter");
    await p.waitForTimeout(2500); await shot(p);
    await p.close();
  },
};

(async () => {
  // wake the free-tier API first
  for (let i = 0; i < 20; i++) { try { const r = await fetch(API + "/api/health"); if (r.ok) break; } catch {} await new Promise((r) => setTimeout(r, 5000)); }
  browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
  for (const [name, fn] of Object.entries(scenes)) {
    if (only.length && !only.includes(name)) continue;
    const t = Date.now();
    try { await fn(); console.log("✓", name, ((Date.now() - t) / 1000).toFixed(1) + "s"); }
    catch (e) { console.log("✗", name, e.message.split("\n")[0]); }
  }
  await browser.close();
})();
