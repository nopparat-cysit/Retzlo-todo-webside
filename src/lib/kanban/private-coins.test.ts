import { describe, expect, it } from "vitest";

import {
  resolveCardRewardPayload,
  getPrivateCoinEntry,
  setPrivateCoinAmount,
  type CardPrivateCoins
} from "@/lib/kanban/private-coins";

describe("card private coin helpers", () => {
  it("reads legacy numeric private coins as unclaimed", () => {
    expect(getPrivateCoinEntry({ user_1: 25 }, "user_1")).toEqual({
      coins: 25,
      claimed: false
    });
  });

  it("preserves claimed state when changing the private coin amount", () => {
    const current: CardPrivateCoins = {
      user_1: { coins: 10, claimed: true }
    };

    expect(setPrivateCoinAmount(current, "user_1", 30)).toEqual({
      user_1: { coins: 30, claimed: true }
    });
  });

  it("removes invalid or zero private coin entries", () => {
    expect(setPrivateCoinAmount({ user_1: { coins: 10, claimed: false } }, "user_1", 0)).toEqual({});
    expect(getPrivateCoinEntry({ user_1: { coins: -2, claimed: false } }, "user_1")).toEqual({
      coins: 0,
      claimed: false
    });
  });

  it("clears all card reward payload values when coin rewards are disabled", () => {
    const current: CardPrivateCoins = {
      user_1: { coins: 25, claimed: false },
      user_2: { coins: 15, claimed: true }
    };

    expect(
      resolveCardRewardPayload({
        activeUserId: "user_1",
        enabled: false,
        privateCoins: current,
        privateGlobalCoins: 25,
        rewardCoins: 50
      })
    ).toEqual({
      privateCoins: {
        user_2: { coins: 15, claimed: true }
      },
      rewardCoins: 0
    });
  });
});
