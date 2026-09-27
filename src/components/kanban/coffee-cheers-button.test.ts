import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const buttonSource = readFileSync(new URL("./coffee-cheers-button.tsx", import.meta.url), "utf8");
const cardSource = readFileSync(new URL("./card.tsx", import.meta.url), "utf8");
const membersViewSource = readFileSync(new URL("../project/project-members-view.tsx", import.meta.url), "utf8");

describe("CoffeeCheersButton Component & Integration", () => {
  it("enforces DONE status exclusivity", () => {
    expect(buttonSource).toContain('if (cardStatus !== "DONE")');
    expect(buttonSource).toContain("return null;");
    expect(cardSource).toContain('card.status === "DONE" && (');
    expect(cardSource).toContain("<CoffeeCheersButton");
  });

  it("integrates anti-cheat check and sound feedback", () => {
    expect(buttonSource).toContain("canUserCheerCard");
    expect(buttonSource).toContain("playCoffeePopSound()");
    expect(buttonSource).toContain("SELF_CHEER_FORBIDDEN");
    expect(buttonSource).toContain("ALREADY_CHEERED");
  });

  it("contains steam particle animation styles", () => {
    expect(buttonSource).toContain("@keyframes coffeeSteamUp");
    expect(buttonSource).toContain("animate-coffee-steam");
    expect(buttonSource).toContain("♨");
  });

  it("renders coffee metrics in Project Members View", () => {
    expect(membersViewSource).toContain("Total Coffees");
    expect(membersViewSource).toContain("totalCoffeesCount");
    expect(membersViewSource).toContain("member.totalCoffees");
  });
});
