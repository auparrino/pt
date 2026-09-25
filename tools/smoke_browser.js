/* Rumo C1 — prueba de humo en el navegador (opcional, no corre en npm test):
   arranca la app, juega un cafezinho, una sesión de Sons, abre una lectura
   con «Leia e ouça», el dictogloss, Eu, el Exame C1 y «Palavra ou não?», y
   falla si hay errores de JavaScript en la consola.
   Requiere Playwright:  NODE_PATH=$(npm root -g) node tools/smoke_browser.js
   Variables opcionales:
     DOCS=ruta   carpeta a servir (por defecto docs/)
     SHOTS=ruta  guarda capturas a 390 px de ancho, en claro y en oscuro
     PORT=8765   puerto del servidor local */
const { chromium } = require("playwright");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

function chromiumPath() {
  const base = "/opt/pw-browsers";
  try {
    const dir = fs.readdirSync(base).filter(d => /^chromium-\d+$/.test(d)).sort().pop();
    const exe = dir && path.join(base, dir, "chrome-linux", "chrome");
    return exe && fs.existsSync(exe) ? exe : undefined;
  } catch (e) { return undefined; }
}

(async () => {
  const port = +(process.env.PORT || 8765);
  const docs = process.env.DOCS || path.join(__dirname, "..", "docs");
  const shots = process.env.SHOTS || "";
  if (shots) fs.mkdirSync(shots, { recursive: true });
  const srv = spawn("python3", ["-m", "http.server", String(port)], { cwd: docs, stdio: "ignore" });
  await new Promise(r => setTimeout(r, 1200));
  const browser = await chromium.launch({ executablePath: chromiumPath() }).catch(() => chromium.launch());
  const errors = global.errors = [];
  const seen = global.seen = [];
  const note = (s) => { seen.push(s); };

  async function newPage(scheme) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: scheme });
    const page = await ctx.newPage();
    page.on("pageerror", e => errors.push("pageerror: " + e.message));
    // a network failure towards an outside host (Commons, without internet) is
    // not a bug: the app falls back to the phone's voice
    page.on("console", m => { if (m.type() === "error" && !/Failed to load resource: net::ERR_/.test(m.text())) errors.push("console: " + m.text()); });
    return page;
  }
  const snap = async (page, name, full) => {
    if (!shots) return;
    await page.waitForTimeout(450);
    await page.screenshot({ path: path.join(shots, name + ".png"), fullPage: !!full });
  };

  const page = await newPage("light");
  await page.goto("http://localhost:" + port + "/?test", { waitUntil: "networkidle" });
  await page.waitForSelector("#pausa", { timeout: 15000 });
  note("hoje: " + (await page.textContent("h1")).trim());
  await snap(page, "hoje-claro", true);

  // a cafezinho round: answer the items whatever they are
  await page.click("#pausa");
  await page.waitForSelector(".card", { timeout: 5000 });
  for (let i = 0; i < 6; i++) {
    const it = await page.evaluate(() => window.__test && window.__test.item());
    if (!it) break;
    if (i === 1) await snap(page, "ronda-claro");
    if (await page.$("#next")) { await page.click("#next"); await page.waitForTimeout(350); continue; }
    if (it.options && await page.$("[data-opt]")) {
      try { await page.click("[data-opt] >> nth=0", { timeout: 2000 }); } catch (e) { /* re-rendered */ }
    } else if (await page.$("#ans")) { await page.fill("#ans", it.answer); await page.click("#send"); }
    else if (await page.$("#wans")) { await page.fill("#wans", it.answer); await page.click("#wsend"); }
    else if (await page.$("#tcheck")) { const n = (await page.$$("[data-tile]")).length; for (let k = 0; k < n; k++) { try { await page.click("#tbank [data-tile] >> nth=0", { timeout: 1500 }); } catch (e) { break; } } await page.click("#tcheck"); }
    else if (await page.$("#reveal")) { await page.click("#reveal"); await page.click("[data-fq='2']"); }
    else break;
    await page.waitForTimeout(400);
    if (i === 0) await snap(page, "feedback-claro");
    if (await page.$("#next")) { await page.click("#next"); await page.waitForTimeout(400); }
  }
  note("cafezinho jugado");
  if (await page.$("#quit")) { await page.click("#quit"); await page.waitForTimeout(300); }

  // Treino → Sons
  await page.click("[data-tab='frasi']");
  await page.waitForSelector(".labs");
  await snap(page, "treino-claro", true);
  if (await page.$("[data-lab='suoni']")) {
    await page.click("[data-lab='suoni']");
    await page.waitForSelector(".bigplay, .options", { timeout: 5000 });
    const it2 = await page.evaluate(() => window.__test.item());
    note("sons: " + it2.type + " / " + it2.say);
    if (await page.$("[data-opt]")) { await page.click("[data-opt] >> nth=0"); await page.waitForTimeout(400); }
    note("sons respondido: " + (await page.$("#fb .feedback") ? "con devolución" : "sin devolución"));
    await page.click("#quit");
  }

  // Ler → the first open reading, with «Leia e ouça»
  await page.click("[data-tab='leggi']");
  await page.waitForSelector(".eps");
  await snap(page, "ler-claro");
  const ep = await page.$("[data-ep]:not([disabled])");
  if (ep) {
    await ep.click();
    await page.waitForSelector("#karplay");
    await page.click("#karplay");
    await page.waitForTimeout(300);
    note("lectura: " + (await page.textContent("#karplay")).trim());
  }

  // Trilha → the week 1 briefing
  await page.click("[data-tab='percorso']");
  await page.waitForSelector(".path");
  await snap(page, "trilha-claro");
  await page.click("[data-week='1']");
  await page.waitForSelector(".missions");
  await snap(page, "semana1-claro", true);
  note("misiones de la semana 1: " + (await page.$$eval(".mission b", els => els.map(e => e.textContent))).join(" | "));
  // the first lesson
  if (await page.$("[data-m='lez']")) {
    await page.click("[data-m='lez'] >> nth=0");
    await page.waitForSelector(".lescard");
    await page.click("#lesnext"); await page.waitForTimeout(300);
    await snap(page, "leccion-claro");
    note("lección abierta");
    await page.click("#lesquit");
  }
  // the dictogloss of week 2
  await page.evaluate(() => { const s = window.__test.state(); s.unlocked = 2; });
  await page.click("[data-tab='percorso']"); await page.click("[data-week='2']");
  if (await page.$("[data-m='dictogloss']")) { await page.click("[data-m='dictogloss']"); await page.waitForSelector("#dgplay"); note("dictogloss ok"); }

  // Eu
  await page.click("[data-tab='io']");
  await page.waitForSelector("#retention");
  note("eu: " + (await page.$$eval("h2", els => els.map(e => e.textContent.trim()))).join(" | "));
  await snap(page, "eu-claro");

  // the C1 exam of week 52
  await page.evaluate(() => { const s = window.__test.state(); s.unlocked = 52; });
  await page.click("[data-tab='percorso']");
  await page.waitForTimeout(500);
  await page.click("[data-week='52']");
  await page.waitForSelector("[data-m='play']", { state: "attached" });
  for (let k = 0; k < 4 && !(await page.$("[data-prova='ascolto']")); k++) { await page.click("[data-m='play']"); await page.waitForTimeout(600); }
  if (await page.$("[data-prova='lettura']")) {
    await snap(page, "exame-claro");
    await page.click("[data-prova='lettura']");
    await page.waitForSelector("#econsegna3");
    note("exame: leitura ok");
    await page.click("#eback2");
    await page.click("[data-prova='strutture']");
    await page.waitForTimeout(500);
    const it3 = await page.evaluate(() => window.__test.item());
    note("exame: estruturas " + (it3 && it3.id));
    if (await page.$("#quit")) { await page.click("#quit"); await page.waitForTimeout(300); }
  }

  // «Palavra ou não?»
  await page.evaluate(() => { const s = window.__test.state(); for (let i = 0; i < 40; i++) s.cards["v:palavra" + i] = { ok: 3, s: 5, d: 5, due: Date.now() + 1e9, last: Date.now() }; });
  await page.click("[data-tab='oggi']");
  if (await page.$("#lampoparole")) { await page.click("#lampoparole"); await page.waitForSelector("[data-lopt]"); note("palavra ou não: " + (await page.textContent(".stem")).trim()); await page.click("#lquit"); }

  // the dark theme (the night over the sea)
  if (shots) {
    const dark = await newPage("dark");
    await dark.goto("http://localhost:" + port + "/?test", { waitUntil: "networkidle" });
    await dark.waitForSelector("#pausa", { timeout: 15000 });
    await snap(dark, "hoje-oscuro", true);
    await dark.click("[data-tab='percorso']"); await dark.waitForSelector(".path");
    await snap(dark, "trilha-oscuro");
    await dark.click("[data-week='1']"); await dark.waitForSelector(".missions");
    await snap(dark, "semana1-oscuro");
    await dark.click("[data-tab='oggi']"); await dark.waitForSelector("#pausa");
    await dark.click("#pausa"); await dark.waitForSelector(".card");
    await snap(dark, "ronda-oscuro");
    const it = await dark.evaluate(() => window.__test && window.__test.item());
    if (it && it.options && await dark.$("[data-opt]")) { await dark.click("[data-opt] >> nth=0"); await snap(dark, "feedback-oscuro"); }
    else if (await dark.$("#next")) { await dark.click("#next"); await snap(dark, "ronda2-oscuro"); }
  }

  console.log(seen.join("\n"));
  console.log(errors.length ? "ERRORS:\n" + errors.join("\n") : "sin errores de JavaScript");
  await browser.close();
  srv.kill();
  process.exit(errors.length ? 1 : 0);
})().catch(e => { console.log("SMOKE FAIL", e.message.split("\n")[0]); console.log((global.seen || []).join("\n")); console.log((global.errors || []).join("\n")); process.exit(2); });
