import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, ChevronRight, CircleHelp, Heart, Leaf, Minus, Moon, Plus, Radio, Shield, Sparkles, Sun, Users, Wind, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MissionResults } from "@/components/mission-results";
import lunarOutpost from "@/assets/lunar-outpost.jpg";
import { GAME_CONFIG as C } from "@/game/config";
import { advanceSol, allocationTotal, canAdvance, createMission, dayPreparation, DEFAULT_ALLOCATION, formatNumber, MISSION_LENGTH, SYSTEMS, type Allocation, type MissionState, type SystemId } from "@/lib/mission";
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
  const [mission, setMission] = useState<MissionState | null>(null);
  const [allocation, setAllocation] = useState<Allocation>({ ...DEFAULT_ALLOCATION });
  const [screen, setScreen] = useState<"plan" | "results" | "final">("plan");
  useEffect(() => { setMission(createMission()); }, []);
  if (!mission) return <main className="flex min-h-screen items-center justify-center bg-background text-primary">Preparing your lunar mission…</main>;
  const remaining = C.dailyBudget - allocationTotal(allocation);
  const today = mission.schedule[mission.sol - 1];
  const event = today?.event;
  const prepared = dayPreparation(mission);
  function changeAllocation(id: SystemId, amount: number) {
    setAllocation((current) => {
      if ((amount > 0 && allocationTotal(current) >= C.dailyBudget) || current[id] + amount < C.startingAllocation) return current;
      return { ...current, [id]: current[id] + amount };
    });
  }
  function runDay() {
    if (!canAdvance(allocation)) return;
    setMission((current) => current ? advanceSol(current, allocation) : current);
    setAllocation({ ...DEFAULT_ALLOCATION });
    setScreen("results");
  }
  function replay() {
    setMission(createMission());
    setAllocation({ ...DEFAULT_ALLOCATION });
    setScreen("plan");
    document.getElementById("decision-desk")?.scrollIntoView({ block: "start" });
  }
  return <main className="min-h-screen bg-background text-foreground">
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
            {mission.ended ? "Mission report" : "Mission in progress"}
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
              <span className="border border-mission-line bg-background/75 px-2.5 py-1.5 text-mission-ink">DAY {String(mission.sol).padStart(2, "0")} / {MISSION_LENGTH}</span>
              <span className="border border-mission-line bg-background/75 px-2.5 py-1.5 text-mission-muted">MOON BASE · 2035</span>
              <span className="border border-food/40 bg-background/75 px-2.5 py-1.5 text-food">4 CREW ON BOARD</span>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 right-4 hidden border-l border-t border-mission-line bg-background/80 px-4 py-2 font-mono text-[9px] uppercase text-mission-muted md:block">
          <span className="mr-2 text-food">●</span>HABITAT CAM 01 · LIVE
        </div>
      </section>


    <section id="decision-desk" className="mx-auto max-w-[1440px] px-4 py-6 sm:px-8 sm:py-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div><p className="font-mono text-[10px] uppercase text-mission-muted">Flight control / decision desk</p><h2 className="mt-1 font-display text-2xl font-semibold">Day {mission.sol} <span className="text-mission-muted">of {C.days}</span></h2></div>
        {screen === "plan" && <div className="flex items-center gap-3 border border-mission-line bg-mission-panel px-3 py-2.5"><Sparkles size={18} className="text-primary" /><div><p className="font-mono text-[9px] uppercase text-mission-muted">Today’s cargo budget</p><p className="font-display font-semibold"><span className="text-primary">{remaining}</span><span className="text-mission-muted"> / {C.dailyBudget} units left</span></p></div></div>}
      </div>
      {screen !== "plan" ? <MissionResults mission={mission} final={screen === "final"} onReplay={replay} onContinue={() => { setScreen(mission.ended ? "final" : "plan"); document.getElementById("decision-desk")?.scrollIntoView({ block: "start" }); }} /> : <>
        <div className="mb-5 border border-primary/35 bg-primary/5 p-4" aria-label="Space weather forecast">
          <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="flex items-center gap-2 font-display font-semibold"><Sun size={18} className="text-primary" />Space weather forecast</h3><span className="font-mono text-[10px] uppercase text-mission-muted">Day {mission.sol} · Placeholder data</span></div>
          <p className="mt-3 font-display font-semibold">{event ? event.type === "flare" ? "Solar flare — a flash of energy from the Sun" : "Solar cloud — a burst of particles from the Sun" : "Quiet Sun — no radiation damage today"}</p>
          {event && <p className="mt-1 break-words font-mono text-xs leading-6 text-mission-muted">{event.date} · {event.type.toUpperCase()} · Class {event.classType} · Intensity {event.intensity}/3 · {event.source}</p>}
          <p className="mt-2 text-sm leading-6 text-mission-muted">{event ? `This event brings ${event.intensity * C.radiationPerIntensity} radiation points. Each shield point blocks ${C.shieldRadiationReduction}. More shielding means less crew health lost.` : "You can give other systems more supplies, but your shield still wears down."}</p>
          {today?.lunarNight && <p className="mt-3 text-sm font-semibold text-primary">Lunar night today: solar panels are dark. Power loses {C.lunarNightPowerLoss} extra points.</p>}
          {prepared.lowPower && <p className="mt-3 text-sm font-semibold text-destructive">Power is below {C.lowPowerThreshold}: Life supplies give only {C.unitGain * C.lowPowerLifeMultiplier} points each today, and Food loses {C.lowPowerFoodLoss} extra points.</p>}
        </div>
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.85fr)]">
          <div className="min-w-0 border border-mission-line bg-mission-panel">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-mission-line px-4 py-3 sm:px-5"><div><h3 className="font-display font-semibold">Allocate today’s supplies</h3><p className="mt-1 text-xs leading-5 text-mission-muted">Each unit adds {C.unitGain} points. Spend all {C.dailyBudget} to run today.</p></div><span className="flex items-center gap-1.5 font-mono text-[10px] uppercase text-primary">{remaining === 0 && <Check size={13} />}{remaining === 0 ? "Ready to deploy" : `${remaining} to assign`}</span></div>
            <div className="divide-y divide-mission-line">{SYSTEMS.map((system) => {
              const detail = SYSTEM_DETAILS[system.id]; const Icon = detail.icon;
              return <div key={system.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_100px_118px] sm:gap-4 sm:px-5">
                <div className="flex min-w-0 items-center gap-3"><div className={`flex size-10 shrink-0 items-center justify-center border border-current/20 bg-mission-panel-raised ${detail.colorClass}`}><Icon size={19} /></div><div className="min-w-0"><p className="font-display text-sm font-semibold">{system.label}</p><p className="text-[10px] leading-5 text-mission-muted">Daily use: −{C.decay[system.id]} points</p></div></div>
                <div className="order-3 col-span-2 flex items-center gap-3 sm:order-none sm:col-span-1 sm:block"><progress className={`status-meter ${detail.meterClass}`} value={prepared.levels[system.id]} max={C.systemMax} aria-label={`${system.label} status ${prepared.levels[system.id]} percent`} /><span className="shrink-0 font-mono text-xs text-mission-muted sm:mt-1 sm:block">{prepared.levels[system.id]}%</span></div>
                <div className="flex items-center justify-end gap-2"><Button variant="outline" size="icon" className="size-9 rounded-sm border-mission-line bg-mission-panel-raised" aria-label={`Use one fewer supply unit for ${system.label}`} disabled={allocation[system.id] === 0} onClick={() => changeAllocation(system.id, -1)}><Minus size={15} /></Button><span className="w-6 text-center font-mono text-base tabular-nums" aria-label={`${system.label} allocated units`}>{allocation[system.id]}</span><Button variant="outline" size="icon" className="size-9 rounded-sm border-mission-line bg-mission-panel-raised" aria-label={`Use one more supply unit for ${system.label}`} disabled={remaining === 0} onClick={() => changeAllocation(system.id, 1)}><Plus size={15} /></Button></div>
              </div>;
            })}</div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-mission-line px-4 py-4 sm:px-5"><p className="text-xs text-mission-muted">{remaining === 0 ? "All supplies assigned. Ready for today." : `Assign ${remaining} more units to continue.`}</p><Button onClick={runDay} disabled={!canAdvance(allocation)} className="h-11 w-full rounded-sm px-5 font-display font-semibold sm:w-auto">Run day {mission.sol}<ChevronRight size={17} /></Button></div>
          </div>
          <aside className="space-y-5">
            <div className="border border-mission-line bg-mission-panel"><div className="border-b border-mission-line px-4 py-3"><h3 className="font-display text-sm font-semibold">Crew & systems</h3></div><div className="p-4"><div className="mb-4 flex items-center justify-between"><span className="flex items-center gap-2 text-sm"><Heart size={15} className="text-destructive" />Crew health</span><span className="font-mono text-sm">{formatNumber(mission.crewHealth)}%</span></div><progress className="status-meter" value={mission.crewHealth} max={C.startingHealth} aria-label={`Crew health ${formatNumber(mission.crewHealth)} percent`} /><div className="mt-4 grid grid-cols-3 gap-2 border-t border-mission-line pt-4 text-center"><div><p className="font-mono text-base">04</p><p className="text-[10px] text-mission-muted">ASTRONAUTS</p></div><div className="border-x border-mission-line"><p className="font-mono text-base">{C.days - mission.history.length}</p><p className="text-[10px] text-mission-muted">DAYS LEFT</p></div><div><p className="flex items-center justify-center gap-1 font-mono text-base"><Radio size={13} className="text-food" />OK</p><p className="text-[10px] text-mission-muted">COMMS</p></div></div></div></div>
            <div className="border-y border-mission-line py-4"><h3 className="font-display text-sm font-semibold">Today’s trade-offs</h3><p className="mt-2 text-sm leading-6 text-mission-muted">The meters show levels after daily use. Supplies refill them, up to {C.systemMax}. Full systems waste extra supplies.</p><p className="mt-2 text-sm leading-6 text-mission-muted">Air or food below {C.needsThreshold} costs {C.needsHealthLoss} crew health. Your shield blocks radiation after supplies are added.</p><p className="mt-2 text-sm leading-6 text-mission-muted">Power below {C.lowPowerThreshold} makes air repairs weaker today, even if you refill power.</p></div>
            <div className="flex gap-2 text-xs leading-5 text-mission-muted"><CircleHelp size={15} className="mt-1 shrink-0 text-primary" /><p>The Moon has no thick air or magnetic shield. Our crew needs power, recycled air and water, radiation cover, and fresh food.</p></div>
          </aside>
        </div>
      </>}
      <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-mission-line pt-4 font-mono text-[9px] uppercase text-mission-muted"><span className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-food" />{mission.ended ? "Mission report ready" : "Mission control online"}</span><span>Space weather data: NASA DONKI</span><span>TRAINING SIM</span></footer>
    </section>
  </main>;
}
