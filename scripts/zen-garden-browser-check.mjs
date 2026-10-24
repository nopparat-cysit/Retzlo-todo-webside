// Render real Garden components with in-memory APIs; no account or database is used.
// Set ZEN_PLAYWRIGHT_PATH / ZEN_CHROMIUM_PATH when using an external browser runtime.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { createServer, transformWithEsbuild } from "vite";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.ZEN_PLAYWRIGHT_PATH || "playwright");
const root = fileURLToPath(new URL("../", import.meta.url)).replace(/\\/g, "/");
const output = process.env.ZEN_SCREENSHOT_DIR || join(tmpdir(), `zen-garden-review-${Date.now()}`);
const fixtureId = "\0zen-fixture.jsx";
const fixture = `
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { ZenGarden } from "/src/components/project/zen-garden.tsx";
import { ZenSanctuaryModal } from "/src/components/project/zen-garden/zen-sanctuary-modal.tsx";
import { ProjectTopbarTools } from "/src/components/project/project-topbar-tools.tsx";
import { LanguageProvider, useLanguage } from "/src/lib/i18n/language-context.tsx";
import { ThemeProvider, useTheme } from "/src/components/theme/theme-provider.tsx";
import { ToastProvider } from "/src/components/ui/toast.tsx";
import "/src/app/globals.css";
function Preview() {
  const { setLanguage } = useLanguage(); const { setTheme } = useTheme();
  const [tools, setTools] = useState(false); const [reading, setReading] = useState(false);
  return <><nav style={{display:"flex",gap:10,padding:12,justifyContent:"center"}}>
    <button data-fixture="th" onClick={()=>setLanguage("th")}>TH</button><button data-fixture="en" onClick={()=>setLanguage("en")}>EN</button>
    {["light","dark","system"].map(t=><button key={t} data-fixture={t} onClick={()=>setTheme(t)}>{t}</button>)}
    <button data-fixture="tools" onClick={()=>setTools(!tools)}>Tools</button><button data-fixture="reading" onClick={()=>setReading(true)}>Reading</button>
  </nav><main style={tools ? {display:"flex",justifyContent:"flex-end",padding:16} : {width:"min(420px, calc(100vw - 24px))",margin:"12px auto"}}>{tools ? <ProjectTopbarTools/> : <ZenGarden/>}</main><ZenSanctuaryModal isOpen={reading} onClose={()=>setReading(false)}/></>;
}
createRoot(document.getElementById("root")).render(<ThemeProvider><LanguageProvider><ToastProvider><Preview/></ToastProvider></LanguageProvider></ThemeProvider>);
`;
const server = await createServer({
  root, configFile: false, server: { host: "127.0.0.1", port: 0, watch: { ignored: ["**/.next/**"] } },
  resolve: { alias: [{ find: "next/navigation", replacement: "\0zen-navigation" }, { find: "@", replacement: `${root}/src` }] },
  esbuild: { jsx: "automatic", tsconfigRaw: { compilerOptions: { jsx: "react-jsx" } } },
  plugins: [{
    name: "zen-garden-review",
    resolveId(id) { if (id === "next/navigation" || id === "\0zen-navigation") return "\0zen-navigation"; if (id === "/zen-fixture.jsx") return fixtureId; },
    load(id) { if (id === "\0zen-navigation") return 'export function useParams(){return {id:"fixture-project"}}'; if (id === fixtureId) return fixture; },
    async transform(code,id) { if(id===fixtureId) return transformWithEsbuild(code,id,{loader:"jsx",jsx:"automatic"}); },
    configureServer(vite) {
      vite.middlewares.use(async(req,res,next)=>{
        if(req.url!=="/") return next();
        res.setHeader("Content-Type","text/html");
        res.end(await vite.transformIndexHtml("/",'<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1" /></head><body><div id="root"></div><script type="module" src="/zen-fixture.jsx"></script></body></html>'));
      });
    }
  }]
});
const date = new Date().toISOString().slice(0,10);
const fortune = { date, grade:"daikichi",gradeName:"โชคดีมาก",gradeNameEn:"Great Fortune",badgeTone:"",verse:"Small roots grow into quiet strength.",verseTh:"รากเล็ก ๆ ที่ได้รับการดูแล จะเติบโตเป็นความเข้มแข็งที่เงียบงาม",oracle:"Let patience guide your progress. Today is a chance to notice the small things that already support you.",oracleTh:"วันนี้เป็นโอกาสที่จะมองเห็นคุณค่าของสิ่งเล็ก ๆ ที่คอยเกื้อหนุนคุณอยู่เสมอ ให้ความอดทนและความอ่อนโยนเป็นผู้นำทาง ไม่จำเป็นต้องรีบร้อน ทุกก้าวเล็ก ๆ ที่ตั้งใจมีความหมาย",workGuidance:"Choose one meaningful task. Give it your attention, then leave room for rest.",workGuidanceTh:"เลือกงานสำคัญหนึ่งอย่าง แล้วให้เวลากับมันอย่างเต็มที่ แบ่งงานเป็นขั้นตอนเล็ก ๆ และเว้นพื้นที่ให้ตัวเองได้พักบ้าง",luckyFocus:"A green notebook",luckyFocusTh:"สมุดบันทึกสีเขียว" };
let state = {nurtureStreak:4,lastWateredDate:null,activeGuardianId:"bonsai",totalNourished:4,totalZenMinutes:2,soundMuted:true};
let coins=480, mode="success", mutations=0;
const notes=[];
let browser, page;
const errors=[];
const checks=[];
try {
  await mkdir(output,{recursive:true});
  await server.listen();
  browser=await chromium.launch({headless:true, ...(process.env.ZEN_CHROMIUM_PATH ? {executablePath:process.env.ZEN_CHROMIUM_PATH}: {})});
  page=await browser.newPage({viewport:{width:1280,height:960},deviceScaleFactor:1});
  page.setDefaultTimeout(12000);
  await page.context().grantPermissions(["clipboard-read","clipboard-write"]);
  await page.route("**/api/projects/fixture-project/notes", async route=>{notes.push(route.request().postDataJSON());return route.fulfill({json:{id:"fixture-note",success:true}});});
  page.on("pageerror",e=>{ errors.push(e.message); console.error("Browser runtime:",e.message); });
  page.on("response",response=>{if(response.url().includes("/zen-garden/") && response.status()>=400) errors.push(`Asset ${response.status()}: ${response.url()}`);});
  await page.addInitScript(()=>{localStorage.setItem("retzlo_language","th");localStorage.setItem("retzlo-theme","dark");});
  await page.route("**/api/zen-garden",async route=>{
    if(route.request().method()==="POST") {
      mutations++;
      await new Promise(resolve=>setTimeout(resolve,450));
      if(mode==="error") return route.fulfill({status:500,json:{success:false,message:"Garden fixture error"}});
      const body=route.request().postDataJSON();
      if(body.action==="nurture") {state={...state,lastWateredDate:date,nurtureStreak:5,dailyFortune:fortune};coins+=5;}
      if(body.action==="set-guardian") state={...state,activeGuardianId:body.guardianId};
      return route.fulfill({json:{success:true,awardedCoins:5,globalCoins:coins,zenGarden:state}});
    }
    return route.fulfill({json:{globalCoins:coins,zenGarden:state}});
  });
  const url=`http://127.0.0.1:${server.httpServer.address().port}`;
  console.log("Garden fixture:",url);
  await page.goto(url,{waitUntil:"domcontentloaded",timeout:90000});
  await page.getByRole("heading",{name:"สวนแห่งสติ"}).waitFor();
  await page.evaluate(()=>Promise.race([document.fonts.ready,new Promise(resolve=>setTimeout(resolve,5000))]));
  console.log("Garden component rendered");
  const shot=async name=>page.screenshot({path:join(output,`${name}.png`),fullPage:true});
  await shot("desktop-dark-th-today");
  await page.setViewportSize({width:390,height:844});
  await shot("mobile-dark-th-ready");
  await page.getByRole("region",{name:"สวนแห่งสติ"}).screenshot({path:join(output,"garden-final-dark-th.png")});
  await page.setViewportSize({width:1280,height:960});
  const tabs=page.getByRole("tablist",{name:"ส่วนต่าง ๆ ของสวน"});
  await tabs.getByRole("tab",{name:"วันนี้",exact:true}).focus();
  await page.keyboard.press("ArrowRight");
  assert.equal(await tabs.getByRole("tab",{name:"พืช",exact:true}).getAttribute("aria-selected"),"true");
  await shot("desktop-dark-th-plants");
  await page.getByRole("region",{name:"สวนแห่งสติ"}).screenshot({path:join(output,"garden-final-plants-th.png")});
  await page.getByRole("button",{name:"ตั้งซากุระสมาธิเป็นผู้พิทักษ์"}).click();
  await page.getByRole("button",{name:"ยกเลิก",exact:true}).click();
  assert.equal(mutations,0);
  await page.getByRole("button",{name:"ตั้งซากุระสมาธิเป็นผู้พิทักษ์"}).click();
  await page.getByRole("dialog").getByRole("button",{name:"ตั้งผู้พิทักษ์",exact:true}).click();
  await page.getByRole("dialog").waitFor({state:"hidden"});
  assert.equal(state.activeGuardianId,"blossom");
  checks.push("Arrow-key tabs; cancel and confirm guardian change");
  await tabs.getByRole("tab",{name:"พักใจ",exact:true}).click();
  await page.getByRole("button",{name:/เริ่มพักใจหนึ่งนาที/}).click();
  await page.getByText("รอบที่ 1/4 · 50%",{exact:true}).waitFor();
  await page.getByRole("button",{name:/หยุดชั่วคราว/}).click();
  await page.getByRole("button",{name:"รีเซ็ตการฝึกลมหายใจ"}).click();
  await page.waitForFunction(()=>document.querySelector('[aria-label="รีเซ็ตการฝึกลมหายใจ"]')?.disabled);
  await shot("desktop-dark-th-breath");
  checks.push("Breathing start, pause, and reset");
  const nestedBefore=mutations;
  await page.locator('[data-fixture="reading"]').click();
  const readyReading=page.getByRole("dialog",{name:"คำทำนายของวันนี้"});
  await readyReading.getByRole("button",{name:/รดน้ำสวนวันนี้/}).waitFor();
  await shot("modal-ready-dark-th");
  await readyReading.getByRole("button",{name:/รดน้ำสวนวันนี้/}).click();
  const nestedConfirm=page.getByRole("dialog",{name:"รดน้ำสวนวันนี้ไหม?"});
  assert.equal(await nestedConfirm.evaluate(el=>getComputedStyle(el).zIndex),"1700");
  await shot("modal-nested-confirmation");
  await nestedConfirm.getByRole("button",{name:"ยกเลิก",exact:true}).click();
  assert.equal(await readyReading.isVisible(),true);
  assert.equal(mutations,nestedBefore);
  await page.keyboard.press("Escape");
  await readyReading.waitFor({state:"hidden"});
  checks.push("Ready full reading; nested watering confirmation above the modal; cancellation preserves reading");
  await tabs.getByRole("tab",{name:"วันนี้",exact:true}).click();
  const before=mutations;
  await page.getByRole("button",{name:/รดน้ำสวนวันนี้/}).click();
  await page.getByRole("button",{name:"ยกเลิก",exact:true}).click();
  assert.equal(mutations,before);
  mode="error";
  await page.getByRole("button",{name:/รดน้ำสวนวันนี้/}).click();
  await page.getByRole("dialog").getByRole("button",{name:"รดน้ำวันนี้",exact:true}).click();
  await page.getByText("Garden fixture error",{exact:true}).waitFor();
  await page.getByRole("button",{name:"ยกเลิก",exact:true}).click();
  mode="success";
  await page.getByRole("button",{name:/รดน้ำสวนวันนี้/}).click();
  await page.getByRole("dialog").getByRole("button",{name:"รดน้ำวันนี้",exact:true}).click();
  assert.equal(await page.getByRole("dialog").getByRole("button",{name:"กำลังบันทึก…",exact:true}).isDisabled(),true);
  await page.getByRole("dialog").waitFor({state:"hidden"});
  await page.getByRole("button",{name:/อ่านคำทำนายวันนี้/}).waitFor();
  await shot("desktop-dark-th-watered");
  await page.getByRole("button",{name:/อ่านคำทำนายวันนี้/}).click();
  await page.getByRole("heading",{name:"คำทำนายของวันนี้"}).waitFor();
  await shot("desktop-dark-th-fortune");
  const reader=page.getByRole("dialog");
  await reader.getByRole("button",{name:"Show English",exact:true}).click();
  await reader.getByRole("heading",{name:"Career & Purpose",exact:true}).waitFor();
  assert.equal(await reader.locator("article section").count(),6);
  await reader.getByRole("button",{name:"Copy reading",exact:true}).click();
  assert.match(await page.evaluate(()=>navigator.clipboard.readText()),/Career|career|Purpose/);
  await reader.getByRole("button",{name:"Add to project notes",exact:true}).click();
  await page.waitForFunction(()=>!document.querySelector('[class*="saveButton"]')?.disabled);
  assert.equal(notes.length,1);
  assert.ok(notes[0].content.length>100);
  await reader.screenshot({path:join(output,"reading-desktop-dark-en.png")});
  await reader.getByRole("button",{name:"แสดงภาษาไทย",exact:true}).click();
  checks.push("Independent reading language, five dimensions, clipboard copy and project-note attachment");
  assert.equal(await page.evaluate(()=>document.body.style.overflow),"hidden");
  const readingButtons=page.getByRole("dialog").getByRole("button");
  await readingButtons.last().focus();
  await page.keyboard.press("Tab");
  assert.equal(await readingButtons.first().evaluate(el=>el===document.activeElement),true);
  await page.keyboard.press("Shift+Tab");
  assert.equal(await readingButtons.last().evaluate(el=>el===document.activeElement),true);
  await page.keyboard.press("Escape");
  await page.getByRole("dialog").waitFor({state:"hidden"});
  assert.equal(await page.getByRole("button",{name:/อ่านคำทำนายวันนี้/}).evaluate(el=>el===document.activeElement),true);
  checks.push("Watering cancellation/pending/error/success; fortune focus cycle/return, Escape and scroll lock");
  await page.waitForFunction(()=>document.querySelectorAll('[role="alert"]').length===0);
  for(const language of ["th","en"]) {
    await page.locator(`[data-fixture="${language}"]`).click();
    for(const theme of ["light","dark","system"]) {
      await page.emulateMedia({colorScheme:"dark",reducedMotion:"reduce"});
      await page.locator(`[data-fixture="${theme}"]`).click();
      await page.setViewportSize({width:390,height:844});
      const tabs2=page.getByRole("tablist");
      for(const tab of await tabs2.getByRole("tab").all()) {
        await tab.click();
        const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth);
        assert.equal(overflow,false,`${language}/${theme}: document overflow`);
      }
      await tabs2.getByRole("tab").first().click();
      await shot(`mobile-${theme}-${language}-watered`);
      await page.getByRole("button",{name:language==="th" ? /อ่านคำทำนายวันนี้/ : /Read today's fortune/}).click();
      const dialog=page.getByRole("dialog");
      await dialog.waitFor();
      await dialog.getByRole("button",{name:language==="th" ? "แสดงภาษาไทย" : "Show English",exact:true}).click();
      const body=dialog.getByRole("region",{name:language==="th" ? "เนื้อหาคำทำนาย" : "Fortune reading"});
      assert.equal(await body.evaluate(el=>el.scrollHeight>el.clientHeight),true);
      await body.evaluate(el=>el.scrollTop=el.scrollHeight);
      await shot(`mobile-${theme}-${language}-fortune`);
      await dialog.screenshot({path:join(output,`reading-${theme}-${language}.png`)});
      const action=dialog.getByRole("button",{name:language==="th" ? "แนบในโน้ตโปรเจกต์" : "Add to project notes",exact:true});
      const bounds=await action.boundingBox();
      assert.ok(bounds.y+bounds.height<=844,"Fortune actions stay visible");
      await page.keyboard.press("Escape");
    }
  }
  await page.emulateMedia({colorScheme:"light"});
  await page.locator('[data-fixture="system"]').click();
  await page.waitForFunction(()=>document.documentElement.dataset.theme==="light");
  assert.equal(await page.getByRole("region",{name:"Zen Garden"}).evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(242, 243, 235)");
  await page.emulateMedia({colorScheme:"dark"});
  await page.waitForFunction(()=>document.documentElement.dataset.theme==="dark");
  checks.push("Thai/English light/dark/system at 390×844, including system light/dark: all tabs fit; fortune scrolls internally");
  await page.locator('[data-fixture="tools"]').click();
  await page.getByRole("button",{name:"Studio tools"}).click();
  await page.getByRole("button",{name:"Garden",exact:true}).click();
  await page.getByRole("heading",{name:"Zen Garden"}).waitFor();
  assert.equal(await page.getByRole("dialog").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(18, 30, 25)");
  await shot("mobile-real-studio-tools");
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth),false);
  await page.locator('[data-fixture="light"]').click();
  await page.getByRole("button",{name:"Studio tools"}).click();
  await page.getByRole("heading",{name:"Zen Garden"}).waitFor();
  assert.equal(await page.getByRole("dialog").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(242, 243, 235)");
  await shot("mobile-real-studio-tools-light");
  await page.keyboard.press("Escape");
  await page.setViewportSize({width:1600,height:1000});
  await page.getByRole("dialog").waitFor({state:"hidden"});
  await page.getByLabel("Garden",{exact:true}).click();
  await page.getByRole("heading",{name:"Zen Garden"}).waitFor();
  await shot("desktop-real-studio-tools");
  await page.keyboard.press("Escape");
  await page.locator('[data-fixture="reading"]').click();
  const finalReading=page.getByRole("dialog");
  await finalReading.getByRole("button",{name:"Show English",exact:true}).click();
  await finalReading.screenshot({path:join(output,"reading-desktop-light-en.png")});
  await page.keyboard.press("Escape");
  checks.push("Actual compact/expanded Studio Tools; scoped popover color and breakpoint dismissal");
  assert.deepEqual(errors,[],"browser runtime errors");
  const result={checks,screenshots:output,runtimeErrors:errors};
  await writeFile(join(output,"result.json"),JSON.stringify(result,null,2));
  console.log(JSON.stringify(result,null,2));
} catch(error) {
  console.error(error);
  await writeFile(join(output,"result.json"),JSON.stringify({error:String(error),stack:error.stack,checks,errors},null,2));
  if(page) await page.screenshot({path:join(output,"failure.png"),timeout:5000}).catch(()=>{});
  process.exitCode=1;
} finally {
  await browser?.close();
  await server.close();
  // Vite writes only its normal ignored node_modules cache; screenshots live outside the repository.
}
