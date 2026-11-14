import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  CircleHelp,
  Heart,
  Leaf,
  Minus,
  Moon,
  Plus,
  Radio,
  RotateCcw,
  Shield,
  Sparkles,
  Sun,
  Users,
  Wind,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import lunarOutpost from "@/assets/lunar-outpost.jpg";
import {
  advanceSol,
  allocationTotal,
  canAdvance,
  DAILY_SUPPLY_BUDGET,
  DEFAULT_ALLOCATION,
  INITIAL_MISSION,
  MISSION_LENGTH,
  missionScore,
  SOL_EVENTS,
  SYSTEMS,
  type Allocation,
  type MissionState,
  type SystemId,
} from "@/lib/mission";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Junior Astronaut Mission Trainer | Lunar Outpost" },
      { name: "description", content: "Run a lunar outpost for six sols. Balance life support, radiation shielding, power, and food to keep your crew safe." },
      { property: "og:title", content: "Junior Astronaut Mission Trainer" },
      { property: "og:description", content: "Can you keep a lunar crew safe for six sols? Take command and find out." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MissionTrainer,
});

const SYSTEM_DETAILS: Record<SystemId, { icon: typeof Wind; explanation: string; colorClass: string; meterClass: string }> = {
  life: { icon: Wind, explanation: "Air, water & habitat", colorClass: "text-life-support", meterClass: "meter-life" },
  shield: { icon: Shield, explanation: "Keep radiation out", colorClass: "text-shielding", meterClass: "meter-shield" },
  power: { icon: Zap, explanation: "Solar & stored energy", colorClass: "text-power", meterClass: "meter-power" },
  food: { icon: Leaf, explanation: "Fresh greenhouse crops", colorClass: "text-food", meterClass: "meter-food" },
};

function MissionTrainer() {
  const [mission, setMission] = useState<MissionState>(INITIAL_MISSION);
  const [allocation, setAllocation] = useState<Allocation>(DEFAULT_ALLOCATION);
  const remaining = DAILY_SUPPLY_BUDGET - allocationTotal(allocation);
  const currentEvent = SOL_EVENTS[Math.min(mission.sol - 1, MISSION_LENGTH - 1)];

  function changeAllocation(system: SystemId, amount: number) {
    setAllocation((current) => {
      if (amount > 0 && allocationTotal(current) >= DAILY_SUPPLY_BUDGET) return current;
      if (amount < 0 && current[system] <= 0) return current;
      return { ...current, [system]: current[system] + amount };
    });
  }

  function runSol() {
    if (!canAdvance(allocation) || mission.ended) return;
    setMission((current) => advanceSol(current, allocation));
    setAllocation(DEFAULT_ALLOCATION);
  }

  function restart() {
    setMission(INITIAL_MISSION);
    setAllocation(DEFAULT_ALLOCATION);
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-mission-line bg-background">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-8">
          <a href="#mission" className="flex min-w-0 items-center gap-3" aria-label="Junior Astronaut Mission Trainer home">
            <div className="flex size-9 shrink-0 items-center justify-center border border-primary/40 bg-primary/10 text-primary">
              <Moon size={19} />
            </div>
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-bold tracking-wide">LUNAR OUTPOST</p>
              <p className="font-mono text-[10px] uppercase text-mission-muted">Junior astronaut mission trainer</p>
            </div>
          </a>
          <div className="hidden items-center gap-2 font-mono text-[11px] uppercase text-mission-muted sm:flex">
            <span className="size-2 animate-pulse rounded-full bg-food" />
            Mission in progress
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-mission-muted">
            <Users size={15} className="text-primary" aria-hidden="true" />
            <span>CREW <span className="text-mission-ink">04</span></span>
          </div>
        </div>
      </header>

      <section id="mission" className="relative isolate min-h-[265px] overflow-hidden border-b border-mission-line sm:min-h-[300px]">
        <img src={lunarOutpost} alt="Lunar habitat, solar panels, and a greenhouse beneath Earth" width={1536} height={1024} fetchPriority="high" className="absolute inset-0 -z-20 size-full object-cover object-[center_59%]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-background via-background/85 to-background/15" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background/75 via-transparent to-background/10" />
        <div className="mission-grid absolute inset-0 -z-10 opacity-40" />
        <div className="mx-auto flex min-h-[265px] max-w-[1440px] items-center px-5 py-8 sm:min-h-[300px] sm:px-8">
          <div className="max-w-2xl">
            <p className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-primary">
              <span className="h-px w-7 bg-primary" />
              Artemis field simulation <span className="text-mission-muted">/ 001</span>
            </p>
            <h1 className="font-display text-4xl font-bold leading-none sm:text-6xl">Your outpost.<br /><span className="text-primary">Your call.</span></h1>
            <p className="mt-4 max-w-lg text-sm leading-6 text-mission-ink/85 sm:text-base">
              Six lunar days. Four astronauts. Every supply choice has a trade-off. Can you get the whole crew home safe?
            </p>
            <div className="mt-5 flex flex-wrap gap-2 font-mono text-[10px] uppercase">
              <span className="border border-mission-line bg-background/75 px-2.5 py-1.5 text-mission-ink">SOL {String(Math.min(mission.sol, MISSION_LENGTH)).padStart(2, "0")} / 06</span>
              <span className="border border-mission-line bg-background/75 px-2.5 py-1.5 text-mission-muted">MOON BASE · 2035</span>
              <span className="border border-food/40 bg-background/75 px-2.5 py-1.5 text-food">4 CREW ON BOARD</span>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 right-4 hidden border-l border-t border-mission-line bg-background/80 px-4 py-2 font-mono text-[9px] uppercase text-mission-muted md:block">
          <span className="mr-2 text-food">●</span>HABITAT CAM 01 · LIVE
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-6 sm:px-8 sm:py-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-mission-muted">Flight control <span className="px-1 text-primary">/</span> decision desk</p>
            <h2 className="mt-1 font-display text-2xl font-semibold">Sol {Math.min(mission.sol, MISSION_LENGTH)} <span className="text-mission-muted">of {MISSION_LENGTH}</span></h2>
          </div>
          <div className="flex items-center gap-3 border border-mission-line bg-mission-panel px-3 py-2.5">
            <div className="flex size-8 items-center justify-center border border-primary/30 bg-primary/10 text-primary"><Sparkles size={16} /></div>
            <div>
              <p className="font-mono text-[9px] uppercase text-mission-muted">Today’s cargo budget</p>
              <p className="font-display text-base font-semibold"><span className="text-primary">{remaining}</span><span className="text-mission-muted"> / {DAILY_SUPPLY_BUDGET} units left</span></p>
            </div>
          </div>
        </div>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.85fr)]">
          <div className="min-w-0 border border-mission-line bg-mission-panel">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-mission-line px-4 py-3 sm:px-5">
              <div>
                <h3 className="font-display text-base font-semibold">Allocate today’s supplies</h3>
                <p className="mt-0.5 text-xs text-mission-muted">Use all {DAILY_SUPPLY_BUDGET} units before the next sol.</p>
              </div>
              <span className={`flex items-center gap-1.5 font-mono text-[10px] uppercase ${remaining === 0 ? "text-food" : "text-primary"}`}>
                {remaining === 0 ? <Check size={13} /> : <CircleHelp size={13} />}
                {remaining === 0 ? "Ready to deploy" : `${remaining} to assign`}
              </span>
            </div>

            <div className="divide-y divide-mission-line">
              {SYSTEMS.map((system) => {
                const detail = SYSTEM_DETAILS[system.id];
                const Icon = detail.icon;
                return (
                  <div key={system.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_112px_118px] sm:gap-5 sm:px-5">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className={`flex size-10 shrink-0 items-center justify-center border border-current/20 bg-mission-panel-raised ${detail.colorClass}`}><Icon size={19} /></div>
                      <div className="min-w-0">
                        <p className="truncate font-display text-sm font-semibold">{system.label}</p>
                        <p className="truncate text-xs text-mission-muted">{detail.explanation}</p>
                      </div>
                    </div>
                    <div className="order-3 col-span-2 flex items-center gap-3 sm:order-none sm:col-span-1 sm:block">
                      <progress className={`status-meter ${detail.meterClass}`} value={mission.levels[system.id]} max={100} aria-label={`${system.label} status ${mission.levels[system.id]} percent`} />
                      <span className="shrink-0 font-mono text-xs text-mission-muted sm:mt-1 sm:block">{mission.levels[system.id]}%</span>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="icon" className="size-9 rounded-sm border-mission-line bg-mission-panel-raised" aria-label={`Use one fewer supply unit for ${system.label}`} disabled={mission.ended || allocation[system.id] === 0} onClick={() => changeAllocation(system.id, -1)}><Minus size={15} /></Button>
                      <span className="w-6 text-center font-mono text-base tabular-nums">{allocation[system.id]}</span>
                      <Button variant="outline" size="icon" className="size-9 rounded-sm border-mission-line bg-mission-panel-raised" aria-label={`Use one more supply unit for ${system.label}`} disabled={mission.ended || remaining === 0} onClick={() => changeAllocation(system.id, 1)}><Plus size={15} /></Button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-mission-line px-4 py-4 sm:px-5">
              <div className="flex items-center gap-2 text-xs text-mission-muted">
                <CircleHelp size={15} className="shrink-0 text-primary" />
                {remaining === 0 ? "Balanced. Let’s see how the crew fares." : `Assign ${remaining} more ${remaining === 1 ? "unit" : "units"} to continue.`}
              </div>
              {mission.ended ? (
                <Button onClick={restart} className="h-11 w-full rounded-sm px-5 font-display font-semibold sm:w-auto"><RotateCcw size={16} />Start a new mission</Button>
              ) : (
                <Button onClick={runSol} disabled={!canAdvance(allocation)} className="h-11 w-full rounded-sm px-5 font-display font-semibold sm:w-auto">Advance to next sol<ChevronRight size={17} /></Button>
              )}
            </div>
          </div>

          <aside className="space-y-5">
            <div className="border border-mission-line bg-mission-panel">
              <div className="flex items-center justify-between border-b border-mission-line px-4 py-3">
                <h3 className="font-display text-sm font-semibold">Crew & systems</h3>
                <span className="font-mono text-[9px] uppercase text-mission-muted">Vitals monitor</span>
              </div>
              <div className="p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm"><Heart size={15} className="text-destructive" /><span>Crew health</span></div>
                  <span className="font-mono text-sm">{mission.crewHealth}<span className="text-mission-muted">%</span></span>
                </div>
                <progress className="status-meter" value={mission.crewHealth} max={100} aria-label={`Crew health ${mission.crewHealth} percent`} />
                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-mission-line pt-4 text-center">
                  <div><p className="font-mono text-base">04</p><p className="mt-0.5 text-[10px] text-mission-muted">ASTRONAUTS</p></div>
                  <div className="border-x border-mission-line"><p className="font-mono text-base">{Math.max(0, MISSION_LENGTH - mission.sol + (mission.ended ? 0 : 1))}</p><p className="mt-0.5 text-[10px] text-mission-muted">SOLS LEFT</p></div>
                  <div><p className="flex items-center justify-center gap-1 font-mono text-base"><Radio size={13} className="text-food" /> OK</p><p className="mt-0.5 text-[10px] text-mission-muted">COMMS</p></div>
                </div>
              </div>
            </div>

            {mission.ended ? (
              <div className={`border p-4 ${mission.success ? "border-food/40 bg-food/5" : "border-destructive/40 bg-destructive/5"}`} role="status" aria-live="polite">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className={`font-mono text-[10px] uppercase ${mission.success ? "text-food" : "text-destructive"}`}>{mission.success ? "Mission complete" : "Mission ended early"}</p>
                    <h3 className="mt-1 font-display text-xl font-bold">{mission.success ? "Crew coming home!" : "Outpost needs help."}</h3>
                  </div>
                  <div className="text-right"><p className="font-mono text-xl text-primary">{missionScore(mission)}</p><p className="text-[9px] text-mission-muted">OUTPOST SCORE</p></div>
                </div>
                <p className="mt-3 text-sm leading-5 text-mission-muted">
                  {mission.success ? "You kept the crew safe through six lunar days. Strong outposts balance everyday needs and prepare for the unexpected." : "A critical system ran too low. In space, life support and radiation shielding protect the crew, so they need steady attention."}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-mission-muted">
                  {mission.history.map((event, index) => <span key={`${event.title}-${index}`} className="border border-mission-line px-2 py-1">SOL {index + 1}: {event.title}</span>)}
                </div>
              </div>
            ) : (
              <div className="border border-primary/35 bg-primary/5">
                <div className="flex items-center gap-2 border-b border-primary/20 px-4 py-3">
                  <div className="flex size-7 items-center justify-center bg-primary/10 text-primary"><Sun size={15} /></div>
                  <div><p className="font-mono text-[9px] uppercase text-primary">Mission update · Sol {mission.sol}</p><p className="font-display text-sm font-semibold">{currentEvent?.title}</p></div>
                  <span className="ml-auto font-mono text-[9px] text-mission-muted">INCOMING</span>
                </div>
                <div className="px-4 py-3">
                  <p className="text-sm leading-5 text-mission-muted">{currentEvent?.detail}</p>
                  <div className="mt-3 flex items-start gap-2 border-t border-mission-line pt-3 text-xs leading-5 text-mission-ink/85">
                    {mission.history.length > 0 ? <ArrowDownRight size={15} className="mt-0.5 shrink-0 text-primary" /> : <ArrowUpRight size={15} className="mt-0.5 shrink-0 text-primary" />}
                    <span>{mission.history.length > 0 ? "Every sol brings a new challenge. Your choices shape the next one." : "Tip: Each extra unit boosts one system, but has to come from somewhere else."}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="border-t border-mission-line pt-3 text-xs leading-5 text-mission-muted">
              <div className="flex gap-2"><CircleHelp size={15} className="mt-0.5 shrink-0 text-primary" /><p><span className="font-semibold text-mission-ink">Mission science:</span> The Moon has no thick atmosphere or magnetic shield. Habitats need reliable power, recycled air and water, radiation cover, and fresh food.</p></div>
            </div>
          </aside>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-mission-line pt-4 font-mono text-[9px] uppercase text-mission-muted">
          <span className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-food" />All systems nominal</span>
          <span className="hidden sm:block">Mission control · Earth ↔ Moon · 384,400 km</span>
          <span>TRAINING SIM · V1.0</span>
        </div>
      </section>
    </main>
  );
}