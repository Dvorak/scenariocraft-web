import { motion } from "framer-motion";
import { Paperclip, Image as ImageIcon, Settings2, Play, RotateCw } from "lucide-react";
import { presets } from "@/lib/scenariocraft/mockData";
import { useScenarioStore } from "@/lib/scenariocraft/store";
import { Card } from "../primitives";

export function ScenarioRequest() {
  const request = useScenarioStore((s) => s.request);
  const setRequest = useScenarioStore((s) => s.setRequest);
  const preset = useScenarioStore((s) => s.preset);
  const setPreset = useScenarioStore((s) => s.setPreset);
  const generate = useScenarioStore((s) => s.generate);
  const running = useScenarioStore((s) => s.running);
  const reset = useScenarioStore((s) => s.reset);

  return (
    <Card
      title="Scenario Request"
      icon={
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 6h16M4 12h10M4 18h16" strokeLinecap="round" />
        </svg>
      }
    >
      <textarea
        value={request}
        onChange={(e) => setRequest(e.target.value)}
        rows={4}
        className="w-full resize-none rounded-xl border border-border bg-surface-muted px-3.5 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-coral/40 focus:outline-none focus:ring-2 focus:ring-coral/20"
        placeholder="Describe the scenario you want to generate…"
      />

      <div className="mt-3 flex items-center gap-1.5">
        <IconButton title="Attach"><Paperclip className="h-4 w-4" /></IconButton>
        <IconButton title="Reference image"><ImageIcon className="h-4 w-4" /></IconButton>
        <IconButton title="Advanced options"><Settings2 className="h-4 w-4" /></IconButton>

        <div className="ml-1.5 flex-1">
          <div className="relative">
            <select
              value={preset}
              onChange={(e) => setPreset(e.target.value)}
              className="w-full appearance-none rounded-xl border border-border bg-surface px-3.5 py-2.5 pr-9 text-sm font-medium text-foreground focus:border-coral/40 focus:outline-none focus:ring-2 focus:ring-coral/20"
            >
              {presets.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <button
          type="button"
          onClick={reset}
          className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-surface text-muted-foreground transition-colors hover:text-foreground"
          title="Reset"
        >
          <RotateCw className="h-4 w-4" />
        </button>

        <motion.button
          type="button"
          onClick={() => generate()}
          disabled={running}
          whileTap={{ scale: 0.96 }}
          className="grid h-10 w-10 place-items-center rounded-xl bg-coral text-coral-foreground shadow-[0_6px_18px_-6px_oklch(0.68_0.19_25/0.6)] transition-transform hover:-translate-y-px disabled:opacity-70"
          title="Generate"
          aria-label="Generate scenario"
        >
          <Play className="h-4 w-4 fill-current" />
        </motion.button>
      </div>
    </Card>
  );
}

function IconButton({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <button
      type="button"
      title={title}
      className="grid h-10 w-10 place-items-center rounded-xl border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-surface-muted hover:text-foreground"
    >
      {children}
    </button>
  );
}
