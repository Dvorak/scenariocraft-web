import { Car, FileText, Gauge } from "lucide-react";
import { projectWorkflowResult } from "@/lib/scenariocraft/resultView";
import { useScenarioStore } from "@/lib/scenariocraft/store";
import { Card, MetricTile } from "../primitives";

export function ScenarioBrief() {
  const workflow = useScenarioStore((state) => state.workflow);
  if (!workflow) {
    return (
      <Card title="Scenario Brief" icon={<FileText className="h-4 w-4" />}>
        <p className="text-sm text-muted-foreground">
          Generate a scenario to see its semantic brief.
        </p>
      </Card>
    );
  }
  const brief = projectWorkflowResult(workflow).brief;

  return (
    <Card title="Scenario Brief" icon={<FileText className="h-4 w-4" />}>
      <div className="grid grid-cols-2 gap-2.5">
        <ActorTile icon={<Car className="h-4 w-4" />} label="Ego" value={brief.egoSpeed} />
        <ActorTile
          icon={<Gauge className="h-4 w-4" />}
          label={brief.secondaryLabel}
          value={brief.secondaryValue}
        />
        <div className="col-span-2">
          <MetricTile label="Target TTC" value={brief.targetTtc} tone="coral" />
        </div>
      </div>
      {brief.context && <p className="mt-3 text-xs text-muted-foreground">{brief.context}</p>}
    </Card>
  );
}

function ActorTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-border/70 bg-surface-muted px-3 py-2.5">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface">{icon}</div>
      <div className="min-w-0">
        <div className="truncate text-[11px] text-muted-foreground">{label}</div>
        <div className="truncate font-mono text-sm font-medium tabular-nums">{value}</div>
      </div>
    </div>
  );
}
