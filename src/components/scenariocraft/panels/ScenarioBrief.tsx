import { Car, FileText, Gauge, UsersRound } from "lucide-react";
import { humanize, projectWorkflowResult } from "@/lib/scenariocraft/resultView";
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

  return (
    <Card title="Scenario Brief" icon={<FileText className="h-4 w-4" />}>
      <ScenarioBriefContent />
    </Card>
  );
}

export function ScenarioBriefContent() {
  const workflow = useScenarioStore((state) => state.workflow);
  if (!workflow) {
    return (
      <div className="flex min-h-40 items-center justify-center px-6 text-center text-xs text-muted-foreground">
        Generate a scenario to see its semantic summary.
      </div>
    );
  }
  const view = projectWorkflowResult(workflow);
  const brief = view.brief;
  const actors = workflow.result.spec.actors ?? [];
  const roadAsset = workflow.result.spec.metadata?.road_asset_id;
  const roadType = workflow.result.spec.road?.type;
  const evidence = [
    view.stages.checks === "passed" ? "Checks" : null,
    view.stages.quality === "passed" ? "OSC quality" : null,
    view.stages.simulation === "passed" ? "Simulation" : null,
  ].filter((value): value is string => value !== null);

  return (
    <div className="p-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <ActorTile icon={<Car className="h-3.5 w-3.5" />} label="Ego" value={brief.egoSpeed} />
        <ActorTile
          icon={<Gauge className="h-3.5 w-3.5" />}
          label={brief.secondaryLabel}
          value={brief.secondaryValue}
        />
        <MetricTile label="Target TTC" value={brief.targetTtc} tone="coral" />
        <ActorTile
          icon={<UsersRound className="h-3.5 w-3.5" />}
          label="Actors"
          value={String(actors.length)}
        />
      </div>
      <div className="mt-3 grid gap-x-5 gap-y-2 sm:grid-cols-2">
        <ContextRow label="Interaction" value={brief.family} />
        <ContextRow
          label="Road"
          value={humanize(
            typeof roadAsset === "string"
              ? roadAsset
              : typeof roadType === "string"
                ? roadType
                : "n/a",
          )}
        />
        <ContextRow
          label="Actors"
          value={
            actors
              .filter((actor) => actor.role !== "ambient_vehicle")
              .map((actor) => humanize(actor.role ?? actor.id ?? "actor"))
              .join(" · ") || "n/a"
          }
        />
        <ContextRow
          label="Evidence"
          value={evidence.length ? `${evidence.join(", ")} passed` : "Pending"}
        />
      </div>
    </div>
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
    <div className="flex min-w-0 items-center gap-2 rounded-xl border border-border/70 bg-surface-muted px-3 py-2.5">
      <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-surface">{icon}</div>
      <div className="min-w-0">
        <div className="truncate text-[10px] text-muted-foreground">{label}</div>
        <div className="truncate font-mono text-[13px] font-medium tabular-nums">{value}</div>
      </div>
    </div>
  );
}

function ContextRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 border-t border-border/70 pt-2">
      <div className="text-[9px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 truncate text-[11px] font-medium">{value}</div>
    </div>
  );
}
