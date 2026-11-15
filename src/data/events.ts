export type SpaceWeatherEvent = {
  date: string;
  type: "flare" | "cme";
  classType: string;
  intensity: 1 | 2 | 3;
  source: "NASA DONKI";
};

// Placeholder examples, NOT live observations. Replace these rows with real DONKI data.
export const SPACE_WEATHER_EVENTS: SpaceWeatherEvent[] = [
  { date: "2026-11-01", type: "flare", classType: "X1.2", intensity: 3, source: "NASA DONKI" },
  { date: "2026-11-02", type: "cme", classType: "M2.1", intensity: 2, source: "NASA DONKI" },
  { date: "2026-11-03", type: "flare", classType: "C3.4", intensity: 1, source: "NASA DONKI" },
  { date: "2026-11-04", type: "cme", classType: "X1.0", intensity: 3, source: "NASA DONKI" },
  { date: "2026-11-05", type: "flare", classType: "M1.5", intensity: 2, source: "NASA DONKI" },
  { date: "2026-11-06", type: "cme", classType: "C2.0", intensity: 1, source: "NASA DONKI" },
  { date: "2026-11-07", type: "flare", classType: "X2.0", intensity: 3, source: "NASA DONKI" },
  { date: "2026-11-08", type: "cme", classType: "M3.2", intensity: 2, source: "NASA DONKI" },
];