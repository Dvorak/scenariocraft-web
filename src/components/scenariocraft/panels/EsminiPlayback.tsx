import { Play, Pause, Maximize2 } from "lucide-react";
import { useState } from "react";
import { useScenarioStore } from "@/lib/scenariocraft/store";
import { Card } from "../primitives";

export function EsminiPlayback() {
  const [playing, setPlaying] = useState(false);
  const t = useScenarioStore((s) => s.playbackTime);
  const setT = useScenarioStore((s) => s.setPlaybackTime);
  const duration = 10;

  return (
    <Card
      title="Playback Esmini"
      icon={
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="6 4 20 12 6 20" fill="currentColor" />
        </svg>
      }
      padded={false}
    >
      <div className="p-5">
        <div className="relative overflow-hidden rounded-xl border border-border/70">
          <svg viewBox="0 0 800 340" className="block h-auto w-full">
            <defs>
              <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#7fc9ff" />
                <stop offset="1" stopColor="#a8dcff" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="800" height="340" fill="url(#sky)" />
            {/* road shoulder */}
            <rect x="0" y="150" width="800" height="140" fill="#8f8f8f" />
            {/* asphalt */}
            <rect x="0" y="170" width="800" height="110" fill="#3b3b3b" />
            {/* lane markings */}
            <g stroke="#f2c94c" strokeWidth="2">
              <line x1="0" y1="225" x2="800" y2="225" />
            </g>
            <g stroke="#ffffff" strokeDasharray="24 20" strokeWidth="3">
              <line x1="0" y1="200" x2="800" y2="200" />
              <line x1="0" y1="250" x2="800" y2="250" />
            </g>
            {/* far horizon buildings */}
            <rect x="0" y="130" width="800" height="20" fill="#c9c9c9" opacity="0.6" />
            {/* parked van */}
            <rect x="500" y="210" width="70" height="20" rx="2" fill="#d9d3c7" />
            {/* ego */}
            <rect x="600" y="240" width="80" height="24" rx="3" fill="#d84a3a" />
            {/* tiny pedestrian */}
            <rect x="565" y="212" width="6" height="6" fill="#3b6bd6" />
            {/* HUD */}
            <text x="16" y="326" fill="#c9f0d6" fontFamily="ui-monospace, monospace" fontSize="11">
              {t.toFixed(2)}s  entity[0]: ego (0) 41.06km/h 83.26m (1, -1, 0.00, 83.26) / (83.26, 0.00 0.00)
            </text>
          </svg>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            className="grid h-9 w-9 place-items-center rounded-full border border-border bg-surface text-foreground hover:bg-surface-muted"
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
          </button>
          <button className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-muted-foreground">
            1.0x
          </button>
          <div className="font-mono text-xs tabular-nums text-muted-foreground">
            {t.toFixed(2)} s / {duration.toFixed(2)} s
          </div>
          <div className="relative flex-1">
            <input
              type="range"
              min={0}
              max={duration}
              step={0.01}
              value={t}
              onChange={(e) => setT(parseFloat(e.target.value))}
              className="scenario-slider w-full"
              aria-label="Timeline"
            />
          </div>
          <button
            className="grid h-9 w-9 place-items-center rounded-full border border-border bg-surface text-muted-foreground hover:text-foreground"
            aria-label="Fullscreen"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}
