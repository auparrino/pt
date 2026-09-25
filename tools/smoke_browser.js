/* Prueba de humo en el navegador (opcional, no corre en npm test): arranca la app, juega una pausa,
   una sesión de Suoni, abre una lectura con karaoke, el dictogloss, Io, el examen C1 y «Parola o no?».
   Requiere Playwright: NODE_PATH=$(npm root -g) node tools/smoke_browser.js */
const { chromium } = require("playwright");
const { spawn } = require("child_process");
(async () => {
  const srv = spawn("python3", ["-m", "http.server", "8765"], { cwd: require("path").join(__dirname, "..", "docs"), stdio: "ignore" });
  await new Promise(r => setTimeout(r, 1200));
  const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" }).catch(async e => {
    return chromium.launch();
  });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const errors = global.errors = [];
  page.on("pageerror", e => errors.push("pageerror: " + e.message));
  // a network failure towards an outside host (Commons, without internet) is
  // not a bug: the app falls back to the phone's voice
  page.on("console", m => { if (m.type() === "error" && !/Failed to load resource: net::ERR_/.test(m.text())) errors.push("console: " + m.text()); });
  await page.goto("http://localhost:8765/?test", { waitUntil: "networkidle" });
  await page.waitForSelector("#pausa", { timeout: 15000 });
  const seen = global.seen = [];
  const shot = async (name) => { seen.push(name); };
  // Oggi rendered
  await shot("oggi: " + (await page.textContent("h1")).trim());
  // a pausa round: answer 4 items whatever they are
  await page.click("#pausa");
  await page.waitForSelector(".card", { timeout: 5000 });
  for (let i = 0; i < 6; i++) {
    const it = await page.evaluate(() => window.__test && window.__test.item());
    if (!it) break;
    if (await page.$("#next")) { await page.click("#next"); await page.waitForTimeout(350); continue; }
    if (it.options && await page.$("[data-opt]")) {
      try { await page.click("[data-opt] >> nth=0", { timeout: 2000 }); } catch (e) { /* re-rendered */ }
    } else if (await page.$("#ans")) { await page.fill("#ans", it.answer); await page.click("#send"); }
    else if (await page.$("#wans")) { await page.fill("#wans", it.answer); await page.click("#wsend"); }
    else if (await page.$("#tcheck")) { const n = (await page.$$("[data-tile]")).length; for (let k = 0; k < n; k++) { try { await page.click("#tbank [data-tile] >> nth=0", { timeout: 1500 }); } catch (e) { break; } } await page.click("#tcheck"); }
    else if (await page.$("#reveal")) { await page.click("#reveal"); await page.click("[data-fq='2']"); }
    else break;
    await page.waitForTimeout(400);
    if (await page.$("#next")) { await page.click("#next"); await page.waitForTimeout(400); }
  }
  await shot("pausa played, items answered");
  if (await page.$("#quit")) { await page.click("#quit"); await page.waitForTimeout(300); }
  // Allena → Suoni round
  await page.click("[data-tab='frasi']");
  await page.waitForSelector("[data-lab='suoni']");
  await page.click("[data-lab='suoni']");
  await page.waitForSelector(".bigplay, .options", { timeout: 5000 });
  const it2 = await page.evaluate(() => window.__test.item());
  await shot("suoni item: " + it2.type + " / " + it2.say);
  if (await page.$("[data-opt]")) { await page.click("[data-opt] >> nth=0"); await page.waitForTimeout(400); }
  await page.waitForTimeout(400);
  await shot("suoni answered: " + (await page.$("#fb .feedback") ? "feedback shown" : "no feedback"));
  await page.click("#quit");
  // Leggi → flood reading
  await page.click("[data-tab='leggi']");
  await page.waitForSelector("[data-ep='ep1']");
  await page.click("[data-ep='ep1']");
  await page.waitForSelector("#karplay");
  await page.click("#karplay");
  await page.waitForTimeout(300);
  await shot("lettura: karaoke button " + (await page.textContent("#karplay")).trim());
  // Percorso → briefing week 1 missions include Suoni + dictogloss
  await page.click("[data-tab='percorso']");
  await page.click("[data-week='1']");
  await page.waitForSelector(".missions");
  const missions = await page.$$eval(".mission b", els => els.map(e => e.textContent));
  await shot("week 1 missions: " + missions.join(" | "));
  // dictogloss screen of week 2
  await page.evaluate(() => { const s = window.__test.state(); s.unlocked = 2; });
  await page.click("#back"); await page.click("[data-tab='percorso']"); await page.click("[data-week='2']");
  if (await page.$("[data-m='dictogloss']")) { await page.click("[data-m='dictogloss']"); await page.waitForSelector("#dgplay"); await shot("dictogloss screen ok"); }
  // Io
  await page.click("[data-tab='io']");
  await page.waitForSelector("#retention");
  await shot("io: " + (await page.$$eval("h2", els => els.map(e => e.textContent.trim()))).join(" | "));
  // week 52 exam screen
  await page.evaluate(() => { const s = window.__test.state(); s.unlocked = 52; });
  await page.click("[data-tab='percorso']");
  await page.waitForTimeout(700);
  await page.click("[data-week='52']");
  await page.waitForTimeout(700);
  await shot("after week52 click: h1=" + ((await page.textContent("h1")) || "").trim().slice(0, 60) + " missions=" + (await page.$$eval(".mission b", els => els.map(e => e.textContent))).join("|") + " unlocked=" + (await page.evaluate(() => window.__test.state().unlocked)));
  await shot("mission attrs: " + (await page.$$eval(".mission", els => els.map(e => e.getAttribute("data-m") + "/" + e.className + "/" + getComputedStyle(e).display))).join(" ; "));
  await page.waitForSelector("[data-m='play']", { state: "attached" });
  for (let k = 0; k < 4 && !(await page.$("[data-prova='ascolto']")); k++) { await page.waitForTimeout(600); await page.click("[data-m='play']"); await page.waitForTimeout(600); }
  await page.waitForSelector("[data-prova='ascolto']");
  await page.click("[data-prova='lettura']");
  await page.waitForSelector("#econsegna3");
  await shot("esame lettura screen ok");
  await page.click("#eback2");
  await page.click("[data-prova='strutture']");
  await page.waitForTimeout(500);
  const it3 = await page.evaluate(() => window.__test.item());
  await shot("esame strutture item: " + (it3 && it3.id));
  if (await page.$("#quit")) { await page.click("#quit"); await page.waitForTimeout(300); }
  if (await page.$("#eback")) { await page.click("#eback"); await page.waitForTimeout(300); }
  // lampo parole
  await page.evaluate(() => { const s = window.__test.state(); for (let i = 0; i < 40; i++) s.cards["v:parola" + i] = { ok: 3, s: 5, d: 5, due: Date.now() + 1e9, last: Date.now() }; });
  await page.click("[data-tab='oggi']");
  if (await page.$("#lampoparole")) { await page.click("#lampoparole"); await page.waitForSelector("[data-lopt]"); await shot("parola o no: " + (await page.textContent(".stem")).trim()); await page.click("#lquit"); }
  console.log(seen.join("\n"));
  console.log(errors.length ? "ERRORS:\n" + errors.join("\n") : "no JS errors");
  await browser.close();
  srv.kill();
  process.exit(errors.length ? 1 : 0);
})().catch(e => { console.log("SMOKE FAIL", e.message.split("\n")[0]); console.log((global.seen || []).join("\n")); console.log((global.errors || []).join("\n")); process.exit(2); });
