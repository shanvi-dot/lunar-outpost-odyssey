import { describe, expect, it } from "vitest";

import {
  advanceSol,
  allocationTotal,
  canAdvance,
  DAILY_SUPPLY_BUDGET,
  DEFAULT_ALLOCATION,
  INITIAL_MISSION,
  MISSION_LENGTH,
} from "@/lib/mission";

describe("lunar outpost mission rules", () => {
  it("requires the full 20-unit supply budget to be assigned", () => {
    expect(allocationTotal(DEFAULT_ALLOCATION)).toBe(20);
    expect(DAILY_SUPPLY_BUDGET).toBe(20);
    expect(canAdvance(DEFAULT_ALLOCATION)).toBe(true);
    expect(canAdvance({ ...DEFAULT_ALLOCATION, life: 4 })).toBe(false);
  });

  it("completes the six-sol mission when all systems receive balanced supplies", () => {
    let state = INITIAL_MISSION;

    for (let sol = 0; sol < MISSION_LENGTH; sol += 1) {
      state = advanceSol(state, DEFAULT_ALLOCATION);
    }

    expect(state.ended).toBe(true);
    expect(state.success).toBe(true);
    expect(state.history).toHaveLength(6);
    expect(state.crewHealth).toBeGreaterThan(0);
  });

  it("ends early when life support is left without supplies", () => {
    const allocation = { ...DEFAULT_ALLOCATION, life: 0, power: 11 };
    let state = INITIAL_MISSION;

    for (let sol = 0; sol < MISSION_LENGTH && !state.ended; sol += 1) {
      state = advanceSol(state, allocation);
    }

    expect(state.ended).toBe(true);
    expect(state.success).toBe(false);
    expect(state.sol).toBeLessThan(MISSION_LENGTH);
    expect(state.crewHealth).toBeLessThan(100);
  });

  it("does not advance until the supply budget is balanced", () => {
    const allocation = { ...DEFAULT_ALLOCATION, life: 4 };
    expect(advanceSol(INITIAL_MISSION, allocation)).toBe(INITIAL_MISSION);
  });
});