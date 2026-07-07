import { Activity } from "lucide-react";
import { useScenarioStore } from "@/lib/scenariocraft/store";
import { Card, StatusDot } from "../primitives";

const labelForStatus = (s: string) => {
  switch (s) {
    case "passed":
      return "Passed";
    case "warning":
      return "Warning";
    case "failed":
      return "Failed";
    case "running":
      return "Running";
    default:
      return "Idle";
  }
};

export function StatusCard() {
  const status = useScenarioStore((s) => s.status);

  const items: { key: string; label: string; status: string }[] = [
    { key: "spec", label: "Spec", status: status.spec === "idle" ? "idle" : status.spec === "warning" ? "warning" : "passed" === status.spec ? "passed" : status.spec === "running" ? "running" : "passed" },
    { key: "checks", label: "Checks", status: status.checks },
    { key: "quality", label: "Quality", status: status.quality },
    { key: "simulation", label: "Simulation", status: status.simulation },
  ];

  // Simpler mapping: use raw status
  const rendered = [
    { label: "Spec", status: status.spec === "passed" ? "passed" : status.spec === "running" ? "running" : status.spec === "warning" ? "warning" : status.spec === "failed" ? "failed" : "idle", note: status.spec === "passed" ? "Generated" : labelForStatus(status.spec) },
    { label: "Checks", status: status.checks, note: labelForStatus(status.checks) },
    { label: "Quality", status: status.quality, note: labelForStatus(status.quality) },
    { label: "Simulation", status: status.simulation, note: labelForStatus(status.simulation) },
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
  void items;
}
