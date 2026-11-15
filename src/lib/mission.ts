import { SPACE_WEATHER_EVENTS, type SpaceWeatherEvent } from "@/data/events";
import { GAME_CONFIG as C } from "@/game/config";

export const MISSION_LENGTH = C.days;
export const DAILY_SUPPLY_BUDGET = C.dailyBudget;
export const SYSTEMS = [
  { id: "life", label: "Life support" },
  { id: "shield", label: "Radiation shield" },
  { id: "power", label: "Power grid" },
  { id: "food", label: "Food grower" },
] as const;
export type SystemId = (typeof SYSTEMS)[number]["id"];
export type Allocation = Record<SystemId, number>;
export type SystemLevels = Record<SystemId, number>;
export const DEFAULT_ALLOCATION: Allocation = { life: C.startingAllocation, shield: C.startingAllocation, power: C.startingAllocation, food: C.startingAllocation };
export const STARTING_LEVELS: SystemLevels = { life: C.startingSystem, shield: C.startingSystem, power: C.startingSystem, food: C.startingSystem };
export type MissionDay = { event: SpaceWeatherEvent | null; lunarNight: boolean };
export type DayResult = {
  day: number;
  forecast: MissionDay;
  allocation: Allocation;
  levels: SystemLevels;
  crewHealth: number;
  radiationDamage: number;
  needsDamage: number;
  lowPower: boolean;
  lines: [string, string, string];
};
export type MissionState = {
  sol: number;
  levels: SystemLevels;
  crewHealth: number;
  schedule: MissionDay[];
  history: DayResult[];
  ended: boolean;
  success: boolean;
};

function shuffled<T>(items: T[], random: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const left = result[i];
    const right = result[j];
    if (left === undefined || right === undefined) continue;
    result[i] = right;
    result[j] = left;
  }
  return result;
}

export function createMission(random: () => number = Math.random): MissionState {
  const events = shuffled(SPACE_WEATHER_EVENTS, random).slice(0, C.days - C.quietDays);
  const weather = shuffled<SpaceWeatherEvent | null>([...events, ...Array<null>(C.quietDays).fill(null)], random);
  const nightDays = shuffled(Array.from({ length: C.days }, (_, index) => index), random).slice(0, C.lunarNights);
  return {
    sol: 1, levels: { ...STARTING_LEVELS }, crewHealth: C.startingHealth,
    schedule: weather.map((event, index) => ({ event, lunarNight: nightDays.includes(index) })),
    history: [], ended: false, success: false,
  };
}

export function allocationTotal(allocation: Allocation): number {
  return SYSTEMS.reduce((sum, system) => sum + allocation[system.id], 0);
}
export function canAdvance(allocation: Allocation): boolean {
  return SYSTEMS.every(({ id }) => Number.isInteger(allocation[id]) && allocation[id] >= C.systemMin) && allocationTotal(allocation) === C.dailyBudget;
}
const clamp = (value: number) => Math.max(C.systemMin, Math.min(C.systemMax, value));

export function dayPreparation(state: MissionState): { levels: SystemLevels; lowPower: boolean } {
  const levels = { ...state.levels };
  for (const { id } of SYSTEMS) levels[id] = clamp(levels[id] - C.decay[id]);
  if (state.schedule[state.sol - 1]?.lunarNight) levels.power = clamp(levels.power - C.lunarNightPowerLoss);
  return { levels, lowPower: levels.power < C.lowPowerThreshold };
}

export function advanceSol(state: MissionState, allocation: Allocation): MissionState {
  const forecast = state.schedule[state.sol - 1];
  if (state.ended || !canAdvance(allocation) || !forecast) return state;
  const { levels, lowPower } = dayPreparation(state);
  for (const { id } of SYSTEMS) {
    const multiplier = id === "life" && lowPower ? C.lowPowerLifeMultiplier : 1;
    levels[id] = clamp(levels[id] + allocation[id] * C.unitGain * multiplier);
  }
  if (lowPower) levels.food = clamp(levels.food - C.lowPowerFoodLoss);
  const needsDamage = levels.life < C.needsThreshold || levels.food < C.needsThreshold ? C.needsHealthLoss : 0;
  const radiationDamage = forecast.event ? Math.max(C.systemMin, forecast.event.intensity * C.radiationPerIntensity - levels.shield * C.shieldRadiationReduction) : 0;
  const crewHealth = Math.max(C.systemMin, state.crewHealth - needsDamage - radiationDamage);
  const lines: DayResult["lines"] = [
    lowPower
      ? `Power fell below ${C.lowPowerThreshold}, so air repairs worked half as well and crops lost ${C.lowPowerFoodLoss} points.`
      : forecast.lunarNight
        ? `Lunar night used ${C.lunarNightPowerLoss} extra power points, but enough power kept air and crops working.`
        : `Air, power, food and shielding used ${C.decay.life}, ${C.decay.power}, ${C.decay.food} and ${C.decay.shield} points. Your supplies helped refill them.`,
    forecast.event
      ? `Your shield blocked ${formatNumber(forecast.event.intensity * C.radiationPerIntensity - radiationDamage)} radiation points. Space weather cost the crew ${formatNumber(radiationDamage)} health.`
      : "The Sun was quiet today, so the crew lost no health to radiation.",
    needsDamage
      ? `Air or food fell below ${C.needsThreshold}, so the crew lost ${needsDamage} more health points.`
      : `Air and food stayed at ${C.needsThreshold} or more, so the crew had enough to breathe and eat.`,
  ];
  const ended = crewHealth <= C.systemMin || state.sol === C.days;
  return {
    ...state, sol: Math.min(C.days, state.sol + 1), levels, crewHealth,
    history: [...state.history, { day: state.sol, forecast, allocation: { ...allocation }, levels: { ...levels }, crewHealth, radiationDamage, needsDamage, lowPower, lines }],
    ended, success: ended && crewHealth > C.systemMin,
  };
}

export function formatNumber(value: number): string {
  return Number(value.toFixed(1)).toString();
}