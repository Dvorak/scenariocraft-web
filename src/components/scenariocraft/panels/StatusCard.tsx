import { Activity } from "lucide-react";
import { emptyStages, projectWorkflowResult } from "@/lib/scenariocraft/resultView";
import { useScenarioStore } from "@/lib/scenariocraft/store";
import type { StageStatus } from "@/lib/scenariocraft/types";
import { Card, StatusDot } from "../primitives";

const noteFor = (status: StageStatus, generated = false) => {
  if (status === "passed") return generated ? "Generated" : "Passed";
  if (status === "warning") return "Warning";
  if (status === "failed") return "Failed";
  if (status === "running") return "Running";
  if (status === "skipped") return "Skipped";
  return "Not run";
};

export function StatusCard() {
  const workflow = useScenarioStore((state) => state.workflow);
  const running = useScenarioStore((state) => state.running);
  const runProgress = useScenarioStore((state) => state.runProgress);
  const stages = workflow ? projectWorkflowResult(workflow).stages : emptyStages();
  if (runProgress) {
    for (const [stage, detail] of Object.entries(runProgress.stages)) {
      if (stage in stages) stages[stage as keyof typeof stages] = detail.status;
    }
  } else if (running && !workflow) {
    stages.intent = "running";
  }
  const rendered = [
    { label: "Intent", status: stages.intent, note: noteFor(stages.intent) },
    { label: "Spec", status: stages.spec, note: noteFor(stages.spec, true) },
    { label: "Build", status: stages.build, note: noteFor(stages.build) },
    { label: "Checks", status: stages.checks, note: noteFor(stages.checks) },
    { label: "Quality", status: stages.quality, note: noteFor(stages.quality) },
    { label: "Sim", status: stages.simulation, note: noteFor(stages.simulation) },
  ];

  return (
    <Card title="Status" icon={<Activity className="h-4 w-4" />}>
      <div className="grid grid-cols-3 gap-x-3 gap-y-3">
        {rendered.map((item) => (
          <div key={item.label} className="min-w-0">
            <div className="truncate text-[11px] text-muted-foreground">{item.label}</div>
            <div className="mt-1 flex min-w-0 items-center gap-1 text-[12px] font-semibold">
              <StatusDot status={item.status} />
              <span className="truncate">{item.note}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
