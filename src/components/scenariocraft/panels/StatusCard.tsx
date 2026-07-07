import { Activity } from "lucide-react";
import { useScenarioStore } from "@/lib/scenariocraft/store";
import { Card, StatusDot } from "../primitives";

const noteFor = (s: string) => {
  if (s === "passed") return "Passed";
  if (s === "warning") return "Warning";
  if (s === "failed") return "Failed";
  if (s === "running") return "Running";
  return "Idle";
};

export function StatusCard() {
  const status = useScenarioStore((s) => s.status);
  const rendered = [
    { label: "Spec", status: status.spec, note: status.spec === "passed" ? "Generated" : noteFor(status.spec) },
    { label: "Checks", status: status.checks, note: noteFor(status.checks) },
    { label: "Quality", status: status.quality, note: noteFor(status.quality) },
    { label: "Simulation", status: status.simulation, note: noteFor(status.simulation) },
  ];

  return (
    <Card title="Status" icon={<Activity className="h-4 w-4" />}>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
        {rendered.map((r) => (
          <div key={r.label}>
            <div className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">{r.label}</div>
            <div className="mt-1.5 flex items-center gap-2 text-sm font-medium">
              <StatusDot status={r.status as never} />
              {r.note}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
