import { ChevronRight, RotateCcw, Check, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNumber, SYSTEMS, type MissionState } from "@/lib/mission";

export function MissionResults({ mission, final, onContinue, onReplay }: {
  mission: MissionState; final: boolean; onContinue: () => void; onReplay: () => void;
}) {
  const result = mission.history.at(-1);
  if (!result) return null;
  return (
    <div className="border-y border-mission-line py-6" aria-live="polite">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase text-primary">{final ? "Mission report" : `Day ${result.day} complete`}</p>
          <h3 className="mt-2 font-display text-3xl font-bold">{final ? mission.success ? "You did it! Crew coming home." : "Mission learning" : "What happened"}</h3>
          {final && <p className="mt-3 max-w-xl text-sm leading-6 text-mission-muted">{mission.success ? "Your crew made it through all six days. Every supply choice helped shape their journey." : "The crew needs help, so this training mission has stopped. Try again: protect your shield, keep the power on, and save supplies for air and food."}</p>}
        </div>
        <div className="flex items-center gap-2 font-mono text-base"><Heart size={18} className="text-destructive" />{formatNumber(mission.crewHealth)}% crew health</div>
      </div>
      {!final && <ol className="my-6 space-y-4">{result.lines.map((line) => <li key={line} className="flex items-start gap-3 text-sm leading-6"><Check size={18} className="mt-1 shrink-0 text-primary" />{line}</li>)}</ol>}
      {!final && <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">{SYSTEMS.map(({ id, label }) => <div key={id}><p className="text-xs text-mission-muted">{label}</p><p className="mt-1 font-mono text-xl">{result.levels[id]}%</p></div>)}</div>}
      {final && <div className="my-6 space-y-5">
        <h4 className="font-display text-lg font-semibold">Your day-by-day journey</h4>
        {mission.history.map((day) => <article key={day.day} className="border border-mission-line bg-mission-panel p-4">
          <div className="flex flex-wrap items-center justify-between gap-2"><h5 className="font-display font-semibold">Day {day.day} · {day.forecast.event ? day.forecast.event.type === "flare" ? "Solar flare" : "Solar cloud" : "Quiet Sun"}{day.forecast.lunarNight ? " · Lunar night" : ""}</h5><span className="font-mono text-xs text-primary">Crew {formatNumber(day.crewHealth)}%</span></div>
          <p className="mt-2 text-xs leading-5 text-mission-muted">Supplies: Life {day.allocation.life} · Shield {day.allocation.shield} · Power {day.allocation.power} · Food {day.allocation.food}</p>
          <p className="text-xs leading-5 text-mission-muted">Systems: Life {day.levels.life}% · Shield {day.levels.shield}% · Power {day.levels.power}% · Food {day.levels.food}%</p>
          <ul className="mt-3 space-y-1 text-sm leading-5">{day.lines.map((line) => <li key={line}>{line}</li>)}</ul>
        </article>)}
      </div>}
      <Button className="h-11 rounded-sm font-display font-semibold" onClick={final ? onReplay : onContinue}>{final ? <RotateCcw size={16} /> : <ChevronRight size={16} />}{final ? "Play again" : mission.ended ? "See mission summary" : `Plan day ${mission.sol}`}</Button>
    </div>
  );
}