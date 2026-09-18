// Real Board/Column/Card and dnd-kit in Chromium; all board APIs use in-memory fixtures.
// Install Playwright, or set KANBAN_PLAYWRIGHT_PATH to an existing package directory.
// KANBAN_CHROMIUM_PATH optionally selects an existing Chromium executable.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rm } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer, transformWithEsbuild } from "vite";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.KANBAN_PLAYWRIGHT_PATH || "playwright");
const browserLog = join(tmpdir(), `kanban-browser-${randomUUID()}.log`);
const root = fileURLToPath(new URL("../", import.meta.url)).replace(/\\/g, "/");
const fixtureId = "\0kanban-browser-fixture.jsx";
const members = [{ id: "user-one", name: "Fixture member", email: "fixture@example.com" }];
const makeCard = (id, columnId, position) => ({
  id, columnId, position, title: id === "a" ? "Alpha task" : `Task ${id}`,
  description: null, note: null, status: columnId === "progress" ? "DOING" : "TODO",
  color: "DEFAULT", checklist: [], dueDate: null, dueDateAllDay: false,
  priority: "MEDIUM", isStarred: false, assigneeIds: id === "a" ? ["user-one"] : [], stickers: []
});
const makeColumns = () => [
  { id: "backlog", name: "Backlog", position: 0, color: "default", icon: "kanban", defaultCardStatus: "TODO", cards: ["a", "b", "c"].map((id, i) => makeCard(id, "backlog", i)) },
  { id: "progress", name: "In Progress", position: 1, color: "default", icon: "kanban", defaultCardStatus: "DOING", cards: [makeCard("d", "progress", 0)] },
  { id: "done", name: "Done", position: 2, color: "default", icon: "kanban", defaultCardStatus: "DONE", cards: [] }
];
const fixtureCode = `
  import React, { StrictMode } from "react";
  import { createRoot } from "react-dom/client";
  import { KanbanBoard } from "/src/components/kanban/board.tsx";
  import { ToastProvider } from "/src/components/ui/toast.tsx";
  import "/src/app/globals.css";
  const members = ${JSON.stringify(members)};
  const root = createRoot(document.getElementById("root"));
  let key = 0;
  window.resetBoard = columns => root.render(
    <StrictMode><ToastProvider key={++key}>
      <main style={{ height: 800, padding: 16 }}>
        <KanbanBoard board={{ id: "fixture", name: "Kanban browser fixture", columns }} members={members} />
      </main>
    </ToastProvider></StrictMode>
  );
  window.resetBoard(${JSON.stringify(makeColumns())});
`;
const server = await createServer({
  root, configFile: false, server: { host: "127.0.0.1", port: 0 },
  resolve: { alias: [{ find: "@", replacement: `${root}/src` }, { find: "next/image", replacement: "\0kanban-image.jsx" }] },
  esbuild: { jsx: "automatic", tsconfigRaw: { compilerOptions: { jsx: "react-jsx" } } },
  plugins: [{
    name: "kanban-browser-fixture",
    async transform(code, id) {
      if (id === fixtureId || id === "\0kanban-image.jsx") {
        return transformWithEsbuild(code, id, { loader: "jsx", jsx: "automatic", tsconfigRaw: { compilerOptions: { jsx: "react-jsx" } } });
      }
    },
    resolveId(id) {
      if (id === "/kanban-browser-fixture.jsx") return fixtureId;
      if (id === "\0kanban-image.jsx") return id;
    },
    load(id) {
      if (id === fixtureId) return fixtureCode;
      // Next's image optimizer needs its application runtime; it does not participate in DnD.
      if (id === "\0kanban-image.jsx") return 'import React from "react"; export default function Image({ unoptimized, fill, priority, ...props }) { return <img {...props} />; }';
    },
    configureServer(vite) {
      vite.middlewares.use(async (req, res, next) => {
        if (req.url !== "/") return next();
        res.setHeader("Content-Type", "text/html");
        res.end(await vite.transformIndexHtml("/", '<html><body><div id="root"></div><script type="module" src="/kanban-browser-fixture.jsx"></script></body></html>'));
      });
    }
  }]
});
let browser;
const errors = [];
const checks = [];
try {
  await server.listen();
  const address = server.httpServer.address();
  browser = await chromium.launch({
    headless: true,
    env: { ...process.env, CHROME_LOG_FILE: browserLog },
    ...(process.env.KANBAN_CHROMIUM_PATH ? { executablePath: process.env.KANBAN_CHROMIUM_PATH } : {})
  });
  const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } });
  page.on("pageerror", error => errors.push(error.message));
  let columns = makeColumns();
  const patches = [];
  const columnPatches = [];
  let gets = 0;
  let mode = "success";
  let patchGate = null;
  let getGate = null;
  const gate = () => {
    let release;
    const promise = new Promise(resolve => { release = resolve; });
    return { promise, release, entered: false };
  };
  const waitForGate = async held => {
    const deadline = Date.now() + 10000;
    while (!held.entered && Date.now() < deadline) await page.waitForTimeout(20);
    assert.ok(held.entered, "expected fixture request within 10 seconds");
  };
  const applyPayload = payload => {
    const card = columns.flatMap(column => column.cards).find(card => card.id === payload.cardId);
    assert.ok(card, "fixture card exists");
    assert.equal(card.columnId, payload.sourceColumnId, "PATCH retains the actual original source");
    const destination = columns.find(column => column.id === payload.destinationColumnId);
    const all = new Map(columns.flatMap(column => column.cards).map(card => [card.id, card]));
    for (const column of columns) {
      const ids = column.id === payload.destinationColumnId ? payload.destinationOrderedCardIds :
        column.id === payload.sourceColumnId ? payload.sourceOrderedCardIds : null;
      if (ids) column.cards = ids.map((id, position) => ({
        ...all.get(id), columnId: column.id, position,
        status: id === payload.cardId ? destination.defaultCardStatus : all.get(id).status
      }));
    }
    assert.equal(columns.flatMap(column => column.cards).filter(card => card.id === payload.cardId).length, 1);
  };
  await page.route("**/api/boards/fixture", async route => {
    gets++;
    const snapshot = structuredClone(columns);
    const held = getGate;
    if (held) { getGate = null; held.entered = true; await held.promise; }
    await route.fulfill({ json: { board: { columns: snapshot } } });
  });
  await page.route("**/api/cards/reorder", async route => {
    const payload = route.request().postDataJSON();
    patches.push(payload);
    const held = patchGate;
    if (held) { patchGate = null; held.entered = true; await held.promise; }
    if (mode === "network") return route.abort("failed");
    if (mode === "http") return route.fulfill({ status: 500, json: { error: "fixture failure" } });
    applyPayload(payload);
    await route.fulfill({ json: { ok: true } });
  });
  await page.route("**/api/columns/reorder", async route => {
    const payload = route.request().postDataJSON();
    columnPatches.push(payload);
    columns = payload.columnIds.map((id, position) => ({ ...columns.find(column => column.id === id), position }));
    await route.fulfill({ json: { ok: true } });
  });
  await page.goto(`http://127.0.0.1:${address.port}/`);
  await page.waitForFunction(() => typeof window.resetBoard === "function");
  const zone = id => page.locator(`[data-card-zone="${id}"]`);
  const card = id => page.locator(`#card-${id}`);
  const ids = async id => zone(id).locator("article[id]").evaluateAll(nodes => nodes.map(node => node.id.slice(5)));
  const expectIds = async (columnId, expected) => {
    await page.waitForFunction(({ columnId, expected }) => {
      const actual = [...document.querySelectorAll(`[data-card-zone="${columnId}"] article[id]`)].map(node => node.id.slice(5));
      return JSON.stringify(actual) === JSON.stringify(expected);
    }, { columnId, expected });
    assert.deepEqual(await ids(columnId), expected);
  };
  const reset = async (next = makeColumns(), collapsed = false) => {
    mode = "success";
    columns = structuredClone(next);
    patches.length = 0;
    columnPatches.length = 0;
    await page.evaluate(({ columns, collapsed }) => {
      localStorage.clear();
      if (collapsed) localStorage.setItem("column-collapsed-progress", "true");
      window.resetBoard(columns);
    }, { columns, collapsed });
    await card("a").waitFor();
    await page.waitForTimeout(120);
  };
  const begin = async id => {
    await card(id).scrollIntoViewIfNeeded();
    const box = await card(id).boundingBox();
    await page.mouse.move(box.x + 25, box.y + 25);
    await page.mouse.down();
    await page.mouse.move(box.x + 32, box.y + 25, { steps: 3 });
    await page.waitForTimeout(50);
  };
  const hover = async (columnId, anchor = null, placement = "before") => {
    const box = await (anchor ? card(anchor) : zone(columnId)).boundingBox();
    const x = box.x + box.width / 2;
    const y = anchor ? box.y + (placement === "before" ? 8 : box.height - 8) : box.y + box.height - 24;
    await page.mouse.move(x, y, { steps: 16 });
    await page.waitForTimeout(100);
  };
  const drop = async (id, columnId, anchor = null, placement = "before") => {
    const count = patches.length;
    await begin(id);
    await hover(columnId, anchor, placement);
    await page.mouse.up();
    await page.waitForFunction(() => document.querySelectorAll("[aria-disabled='true'][id^='card-']").length === 0);
    await page.waitForTimeout(120);
    assert.equal(patches.length, count + 1, "one PATCH per successful drop");
  };

  await reset();
  await drop("a", "progress", "d");
  await expectIds("progress", ["a", "d"]);
  assert.equal(patches[0].sourceColumnId, "backlog");
  assert.ok(await page.getByRole("alert").filter({ hasText: "Card moved." }).count());
  await drop("a", "done"); await expectIds("done", ["a"]);
  await drop("a", "backlog"); await expectIds("backlog", ["b", "c", "a"]);
  await drop("a", "done"); await expectIds("done", ["a"]);
  await drop("a", "progress"); await expectIds("progress", ["d", "a"]);
  await drop("a", "backlog", "b"); await expectIds("backlog", ["a", "b", "c"]);
  checks.push("all six directed column pairs, empty zones, before/append, original-source PATCH");

  await reset();
  await drop("a", "backlog", "b", "after"); await expectIds("backlog", ["b", "a", "c"]);
  await drop("a", "backlog"); await expectIds("backlog", ["b", "c", "a"]);
  await drop("a", "backlog", "b"); await expectIds("backlog", ["a", "b", "c"]);
  await begin("a"); await hover("progress", "d"); await page.keyboard.press("Escape"); await page.mouse.up();
  await expectIds("backlog", ["a", "b", "c"]); assert.equal(patches.length, 3);
  await begin("a"); await hover("progress"); await page.mouse.move(1450, 950, { steps: 8 }); await page.mouse.up();
  await expectIds("backlog", ["a", "b", "c"]); assert.equal(patches.length, 3);
  await begin("a"); const same = await zone("backlog").boundingBox(); await page.mouse.move(same.x + 40, same.y + 12); await page.mouse.up();
  await expectIds("backlog", ["a", "b", "c"]); assert.equal(patches.length, 3);
  checks.push("same-column top/middle/bottom, Escape, outside release, no-op without requests");

  await reset(makeColumns(), true);
  await drop("a", "progress");
  assert.deepEqual(columns[1].cards.map(card => card.id), ["d", "a"]);
  await zone("progress").getByRole("button", { name: "Expand In Progress" }).click();
  await expectIds("progress", ["d", "a"]);
  checks.push("collapsed column receives at the end and expands with persisted order");

  await reset();
  await page.getByPlaceholder("Search cards...").fill("Alpha");
  await drop("a", "progress");
  await expectIds("progress", ["a"]);
  assert.deepEqual(patches[0].destinationOrderedCardIds, ["d", "a"]);
  await page.getByPlaceholder("Search cards...").fill("");
  await expectIds("progress", ["d", "a"]);
  checks.push("search filtering preserves hidden cards and full PATCH order");

  for (const filter of ["today", "assignee"]) {
    const filtered = makeColumns();
    filtered[0].cards[0].dueDate = new Date(Date.now() + 3600000).toISOString();
    await reset(filtered);
    if (filter === "today") await page.getByRole("button", { name: "Today", exact: true }).click();
    else {
      await page.getByRole("combobox", { name: "Filter cards by assignee" }).click();
      await page.getByRole("option", { name: "Fixture member (fixture@example.com)", exact: true }).click();
    }
    await drop("a", "progress");
    await expectIds("progress", ["a"]);
    assert.deepEqual(patches[0].destinationOrderedCardIds, ["d", "a"]);
    checks.push(`${filter} filtering preserves hidden destination cards`);
  }

  await reset();
  const duringDrag = gate(); getGate = duringDrag;
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await waitForGate(duringDrag);
  await begin("a"); await hover("progress");
  await expectIds("progress", ["d", "a"]);
  duringDrag.release();
  await page.waitForTimeout(150);
  await expectIds("progress", ["d", "a"]);
  await page.mouse.up();
  await page.waitForTimeout(150);
  assert.equal(patches.length, 1);
  checks.push("GET completing during an active drag cannot overwrite the preview");

  await reset();
  const slow = gate(); patchGate = slow;
  await begin("a"); await hover("progress"); await page.mouse.up();
  await waitForGate(slow);
  await expectIds("progress", ["d", "a"]);
  const beforeGets = gets;
  await page.waitForTimeout(3200);
  await expectIds("progress", ["d", "a"]);
  assert.equal(gets, beforeGets, "polling stays blocked throughout pending PATCH");
  assert.equal(await page.getByRole("button", { name: "Undo", exact: true }).isDisabled(), true);
  await begin("b"); await hover("done"); await page.mouse.up(); assert.equal(patches.length, 1);
  slow.release();
  await page.getByRole("button", { name: "Undo", exact: true }).waitFor({ state: "visible" });
  await page.waitForTimeout(200);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expectIds("backlog", ["a", "b", "c"]);
  assert.equal(patches.length, 2);
  checks.push("PATCH delayed beyond polling interval, drag/Undo lock, successful Undo after save");

  for (const failure of ["http", "network"]) {
    await reset(); mode = failure;
    await begin("a"); await hover("progress"); await page.mouse.up();
    await expectIds("backlog", ["a", "b", "c"]);
    await page.getByRole("alert").filter({ hasText: "Sync failed. Changes rolled back." }).waitFor();
    assert.equal(await page.getByRole("button", { name: "Undo", exact: true }).isDisabled(), true);
    assert.equal(patches.length, 1);
    checks.push(`${failure} failure restores snapshot and shows error Toast without undo history`);
  }

  await reset();
  const stale = gate(); getGate = stale;
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await waitForGate(stale);
  await drop("a", "progress");
  stale.release();
  await page.waitForTimeout(300);
  await expectIds("progress", ["d", "a"]);
  await page.waitForTimeout(2800);
  await expectIds("progress", ["d", "a"]);
  checks.push("GET started before drag and completed after save is discarded; fresh polling resumes");

  await reset();
  const columnHandle = page.getByRole("button", { name: "Drag column" }).first();
  let box = await columnHandle.boundingBox();
  await page.mouse.move(box.x + 4, box.y + 4); await page.mouse.down();
  await page.mouse.move(box.x + 12, box.y + 4, { steps: 3 });
  const targetHeader = await zone("progress").locator("..").locator("header").boundingBox();
  await page.mouse.move(targetHeader.x + targetHeader.width / 2, targetHeader.y + 10, { steps: 16 });
  await page.waitForTimeout(100); await page.mouse.up();
  await page.waitForTimeout(200);
  assert.deepEqual(columns.map(column => column.id), ["progress", "backlog", "done"]);
  assert.equal(columnPatches.length, 1);
  await reset();
  box = await page.getByRole("button", { name: "Drag column" }).first().boundingBox();
  await page.mouse.move(box.x + 4, box.y + 4); await page.mouse.down();
  await page.mouse.move(1450, 950, { steps: 16 });
  await page.waitForTimeout(100); await page.mouse.up();
  await page.waitForTimeout(150);
  assert.equal(columnPatches.length, 0, "outside column release must not PATCH");
  assert.deepEqual(columns.map(column => column.id), ["backlog", "progress", "done"]);
  checks.push("column sorting still works; outside column release sends no PATCH");

  const scrolled = makeColumns();
  scrolled[1].cards = Array.from({ length: 16 }, (_, i) => makeCard(`p${i}`, "progress", i));
  await reset(scrolled);
  await zone("progress").evaluate(node => { node.scrollTop = node.scrollHeight; });
  await drop("a", "progress", "p15", "after");
  assert.equal(columns[1].cards[16].id, "a");
  checks.push("scrolled destination receives after its last card");

  assert.deepEqual(errors, [], "no React errors or maximum update depth loops");
  console.log(JSON.stringify({ browser: "Chromium", checks: checks.length, passed: checks }, null, 2));
} finally {
  if (browser) await browser.close();
  await server.close();
  await rm(browserLog, { force: true });
}
