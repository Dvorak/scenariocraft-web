import { motion } from "framer-motion";
import { useScenarioStore } from "@/lib/scenariocraft/store";

const tabs = [
  { id: "workspace", label: "Workspace" },
  { id: "advanced", label: "Advanced" },
] as const;

export function AppHeader() {
  const view = useScenarioStore((s) => s.view);
  const setView = useScenarioStore((s) => s.setView);

  return (
    <header className="flex items-center justify-between gap-6">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-foreground text-background">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="M4 17l5-11 3 6 3-4 5 9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="min-w-0">
          <h1 className="text-[22px] font-semibold tracking-tight leading-none">
            ScenarioCraft
          </h1>
          <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            Scenario authoring · validation · repair
          </p>
        </div>
      </div>

      <div
        role="tablist"
        aria-label="View"
        className="relative flex items-center gap-1 rounded-full border border-border bg-surface p-1 shadow-[0_1px_2px_rgba(15,15,15,0.03)]"
      >
        {tabs.map((tab) => {
          const active = view === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={active}
              onClick={() => setView(tab.id)}
              className={`relative z-10 rounded-full px-6 py-2 text-sm font-medium transition-colors ${
                active ? "text-coral" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="view-pill"
                  className="absolute inset-0 -z-10 rounded-full bg-coral-soft ring-1 ring-coral/25"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              {tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
