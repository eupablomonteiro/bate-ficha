import { describe, it, expect } from "vitest";
import { setFollowingState, filterPlayers } from "../players";

describe("players utils", () => {
  const players = [
    { _id: "1", isFollowing: false },
    { _id: "2", isFollowing: true },
  ];

  it("setFollowingState updates status", () => {
    const result = setFollowingState(players, "1", true);
    expect(result?.[0].isFollowing).toBe(true);
    expect(players[0].isFollowing).toBe(false);
  });

  it("filterPlayers not-following excludes self", () => {
    const result = filterPlayers(players, "not-following", "2");
    expect(result.map((p) => p._id)).toEqual(["1"]);
  });
});
