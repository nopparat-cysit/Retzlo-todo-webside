import { describe, expect, it } from "vitest";

import {
  cardToneVariants,
  getCardTone,
  getStateTone,
  stateToneVariants
} from "@/lib/theme/ui-variants";

describe("shared UI tone variants", () => {
  it("exposes the default card tone and nine themed card tones", () => {
    expect(Object.keys(cardToneVariants)).toEqual([
      "DEFAULT",
      "LAVENDER",
      "ROSE",
      "AMBER",
      "CYAN",
      "EMERALD",
      "BLUE",
      "VIOLET",
      "SLATE",
      "WINE"
    ]);
    expect(getCardTone("missing")).toBe(cardToneVariants.DEFAULT);
  });

  it("maps app state tones for shared empty and error states", () => {
    expect(Object.keys(stateToneVariants)).toEqual(["empty", "error", "warning", "success", "info"]);
    expect(getStateTone("error").panel).toContain("theme-danger");
    expect(getStateTone("unknown")).toBe(stateToneVariants.info);
  });
});
