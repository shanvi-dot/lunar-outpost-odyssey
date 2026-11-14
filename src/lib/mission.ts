export const MISSION_LENGTH = 6;
export const DAILY_SUPPLY_BUDGET = 20;

export const SYSTEMS = [
  { id: "life", label: "Life support", short: "LIFE", target: 5, color: "life" },
  { id: "shield", label: "Radiation shield", short: "SHIELD", target: 4, color: "shield" },
  { id: "power", label: "Power grid", short: "POWER", target: 6, color: "power" },
  { id: "food", label: "Food grower", short: "FOOD", target: 5, color: "food" },
] as const;

export type SystemId = (typeof SYSTEMS)[number]["id"];
export type Allocation = Record<SystemId, number>;
export type SystemLevels = Record<SystemId, number>;

export const DEFAULT_ALLOCATION: Allocation = { life: 5, shield: 4, power: 6, food: 5 };
export const STARTING_LEVELS: SystemLevels = { life: 82, shield: 76, power: 88, food: 78 };

export type MissionEvent = {
  title: string;
  detail: string;
  impact: Partial<SystemLevels>;
};

export const SOL_EVENTS: MissionEvent[] = [
  { title: "Dust storm incoming", detail: "Lunar dust blankets the solar panels. Extra power keeps the lights on.", impact: { power: -15 } },
  { title: "Solar flare alert", detail: "A burst of radiation is headed our way. Extra shielding protects the crew.", impact: { shield: -18 } },
  { title: "Greenhouse check", detail: "A nutrient mix is running low. Food investment helps the crops bounce back.", impact: { food: -15 } },
  { title: "Air filter clog", detail: "Fine dust is slowing the habitat filters. Life support needs a little extra care.", impact: { life: -16 } },
  { title: "Long lunar night", detail: "The Sun dips below the ridge. A strong power grid carries the habitat through.", impact: { power: -18 } },
  { title: "A clear view of Earth", detail: "The crew spots home above the horizon. A steady outpost makes the final sol a celebration.", impact: {} },
];

export type MissionState = {
  sol: number;
  levels: SystemLevels;
  crewHealth: number;
  history: MissionEvent[];
  ended: boolean;
  success: boolean;
};

export const INITIAL_MISSION: MissionState = {
  sol: 1,
  levels: STARTING_LEVELS,
  crewHealth: 100,
  history: [],
  ended: false,
  success: false,
};

export function allocationTotal(allocation: Allocation): number {
  return SYSTEMS.reduce((sum, system) => sum + allocation[system.id], 0);
}

export function canAdvance(allocation: Allocation): boolean {
  return allocationTotal(allocation) === DAILY_SUPPLY_BUDGET;
}

export function advanceSol(state: MissionState, allocation: Allocation): MissionState {
  if (state.ended || !canAdvance(allocation)) return state;

  const event = SOL_EVENTS[state.sol - 1];
  if (!event) return state;

  const levels = { ...state.levels };
  for (const system of SYSTEMS) {
    const surplus = allocation[system.id] - system.target;
    levels[system.id] = Math.max(0, Math.min(100, levels[system.id] + surplus * 5 + (event.impact[system.id] ?? 0)));
  }

  const danger = levels.life < 35 || levels.shield < 35;
  const crewHealth = Math.max(0, state.crewHealth - (danger ? 18 : 0));
  const survived = crewHealth > 0 && SYSTEMS.every(({ id }) => levels[id] > 0);
  const sol = Math.min(MISSION_LENGTH, state.sol + 1);
  const ended = !survived || state.sol === MISSION_LENGTH;

  return {
    sol,
    levels,
    crewHealth,
    history: [...state.history, event],
    ended,
    success: survived && state.sol === MISSION_LENGTH,
  };
}

export function missionScore(state: MissionState): number {
  const systemAverage = SYSTEMS.reduce((sum, system) => sum + state.levels[system.id], 0) / SYSTEMS.length;
  return Math.round((systemAverage * 0.7 + state.crewHealth * 0.3));
}