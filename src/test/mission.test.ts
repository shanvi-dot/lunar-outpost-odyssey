import { describe, expect, it } from "vitest";
import { SPACE_WEATHER_EVENTS } from "@/data/events";
import { advanceSol, canAdvance, createMission, dayPreparation, DEFAULT_ALLOCATION, type MissionState } from "@/lib/mission";

const balanced = { life: 5, shield: 5, power: 5, food: 5 };
function quietMission(): MissionState {
  const mission = createMission(() => 0.5);
  return { ...mission, schedule: Array.from({ length: 6 }, () => ({ event: null, lunarNight: false })) };
}

describe("Lunar Outpost rules", () => {
  it("starts all four systems at 80 and crew at 100", () => {
    const state = createMission();
    expect(state.levels).toEqual({ life: 80, shield: 80, power: 80, food: 80 });
    expect(state.crewHealth).toBe(100);
  });
  it("starts allocation at zero in all systems", () => {
    expect(DEFAULT_ALLOCATION).toEqual({ life: 0, shield: 0, power: 0, food: 0 });
  });
  it("requires exactly 20 whole nonnegative supply units", () => {
    expect(canAdvance(balanced)).toBe(true);
    expect(canAdvance({ ...balanced, life: 4 })).toBe(false);
    expect(canAdvance({ ...balanced, life: 6 })).toBe(false);
    expect(canAdvance({ life: -1, shield: 11, power: 5, food: 5 })).toBe(false);
    expect(canAdvance({ life: 4.5, shield: 5.5, power: 5, food: 5 })).toBe(false);
  });
  it("decays Life 8, Power 10, Food 7, Shield 3 before supplies", () => {
    expect(dayPreparation(quietMission()).levels).toEqual({ life: 72, power: 70, food: 73, shield: 77 });
  });
  it("adds four points per unit", () => {
    expect(advanceSol(quietMission(), balanced).levels).toEqual({ life: 92, power: 90, food: 93, shield: 97 });
  });
  it("caps all systems at 100", () => {
    const state = { ...quietMission(), levels: { life: 100, shield: 100, power: 100, food: 100 } };
    expect(advanceSol(state, balanced).levels).toEqual({ life: 100, shield: 100, power: 100, food: 100 });
  });
  it("never lets a system fall below zero", () => {
    expect(dayPreparation({ ...quietMission(), levels: { life: 0, shield: 0, power: 0, food: 0 } }).levels).toEqual({ life: 0, shield: 0, power: 0, food: 0 });
  });
  it("halves Life supply gains and loses five extra Food below 30 power", () => {
    const state = { ...quietMission(), levels: { life: 80, shield: 80, power: 39, food: 80 } };
    const result = advanceSol(state, balanced);
    expect(result.levels.life).toBe(82);
    expect(result.levels.food).toBe(88);
    expect(result.levels.power).toBe(49);
    expect(result.history[0]?.lowPower).toBe(true);
  });
  it("does not couple systems when post-decay power is exactly 30", () => {
    const result = advanceSol({ ...quietMission(), levels: { life: 80, shield: 80, power: 40, food: 80 } }, balanced);
    expect(result.levels.life).toBe(92);
    expect(result.levels.food).toBe(93);
  });
  it("lunar night costs 15 extra power", () => {
    const state = quietMission();
    state.schedule[0] = { event: null, lunarNight: true };
    expect(dayPreparation(state).levels.power).toBe(55);
  });
  it.each(["life", "food"] as const)("%s below 25 costs 10 crew health", (id) => {
    const state = quietMission();
    state.levels[id] = 24;
    const allocation = { life: 0, food: 0, shield: 10, power: 10 };
    expect(advanceSol(state, allocation).crewHealth).toBe(90);
  });
  it("both unmet needs cost 10 total, and exactly 25 costs none", () => {
    const allocation = { life: 0, food: 0, shield: 10, power: 10 };
    const state = quietMission();
    state.levels.life = 20; state.levels.food = 20;
    expect(advanceSol(state, allocation).crewHealth).toBe(90);
    state.levels.life = 33; state.levels.food = 32;
    expect(advanceSol(state, allocation).crewHealth).toBe(100);
  });
  it("radiation is intensity times 12 minus final shield times 0.12", () => {
    const state = quietMission();
    state.schedule[0] = { lunarNight: false, event: { date: "2026-01-01", type: "flare", classType: "X1.2", intensity: 3, source: "NASA DONKI" } };
    const result = advanceSol(state, balanced);
    expect(result.history[0]?.radiationDamage).toBeCloseTo(36 - 97 * 0.12);
    expect(result.crewHealth).toBeCloseTo(100 - (36 - 97 * 0.12));
  });
  it("radiation has a zero minimum", () => {
    const state = quietMission();
    state.schedule[0] = { lunarNight: false, event: { date: "2026-01-01", type: "flare", classType: "C1.0", intensity: 1, source: "NASA DONKI" } };
    const result = advanceSol(state, { life: 4, shield: 6, power: 5, food: 5 });
    expect(result.history[0]?.radiationDamage).toBe(0);
    expect(result.crewHealth).toBe(100);
  });
  it("creates six days with exactly one quiet day and one lunar night", () => {
    const state = createMission(() => 0.4);
    expect(state.schedule).toHaveLength(6);
    expect(state.schedule.filter((day) => !day.event)).toHaveLength(1);
    expect(state.schedule.filter((day) => day.lunarNight)).toHaveLength(1);
    expect(state.schedule.filter((day) => day.event).every((day) => SPACE_WEATHER_EVENTS.includes(day.event as typeof SPACE_WEATHER_EVENTS[number]))).toBe(true);
    expect(createMission(() => 0.8).schedule).not.toEqual(state.schedule);
  });
  it("wins after exactly six days with health above zero", () => {
    let state = quietMission();
    for (let day = 0; day < 5; day += 1) state = advanceSol(state, balanced);
    expect(state.ended).toBe(false);
    state = advanceSol(state, balanced);
    expect(state.ended).toBe(true);
    expect(state.success).toBe(true);
    expect(state.history).toHaveLength(6);
    expect(advanceSol(state, balanced)).toBe(state);
  });
  it("ends only when health reaches zero, not when a system reaches zero", () => {
    const state = quietMission();
    state.levels.life = 0;
    const allocation = { life: 0, shield: 10, power: 5, food: 5 };
    expect(advanceSol(state, allocation).ended).toBe(false);
    state.crewHealth = 5;
    const result = advanceSol(state, allocation);
    expect(result.crewHealth).toBe(0);
    expect(result.ended).toBe(true);
    expect(result.success).toBe(false);
    expect(result.history).toHaveLength(1);
  });
  it("does not advance an incomplete allocation or mutate input state", () => {
    const state = quietMission();
    const snapshot = structuredClone(state);
    expect(advanceSol(state, DEFAULT_ALLOCATION)).toBe(state);
    advanceSol(state, balanced);
    expect(state).toEqual(snapshot);
  });
});