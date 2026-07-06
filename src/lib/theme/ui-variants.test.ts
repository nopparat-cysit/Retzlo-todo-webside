import { describe, expect, it } from "vitest";

import {
  cardToneVariants,
  getCardTone,
  getStateTone,
  getStatusTone,
  stateToneVariants,
  statusToneVariants
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

  it("maps card statuses to stable button and badge tones", () => {
    expect(Object.keys(statusToneVariants)).toEqual(["TODO", "DOING", "WAITING", "DONE"]);
    expect(getStatusTone("DONE").badge).toContain("emerald");
    expect(getStatusTone("UNKNOWN").label).toBe("Todo");
  });

  it("maps app state tones for shared empty and error states", () => {
    expect(Object.keys(stateToneVariants)).toEqual(["empty", "error", "warning", "success", "info"]);
    expect(getStateTone("error").panel).toContain("red");
    expect(getStateTone("unknown")).toBe(stateToneVariants.info);
  });
});
