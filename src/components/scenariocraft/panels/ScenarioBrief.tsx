import { FileText, Car, User } from "lucide-react";
import { brief, metrics } from "@/lib/scenariocraft/mockData";
import { Card, MetricTile } from "../primitives";

export function ScenarioBrief() {
  return (
    <Card title="Scenario Brief" icon={<FileText className="h-4 w-4" />}>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <MetricTile label="Target TTC" value={metrics.targetTTC} />
        <MetricTile label="Lead Time" value={metrics.leadTime} />
        <MetricTile label="Trigger Threshold" value={metrics.triggerThreshold} />
        <MetricTile label="Pedestrian Time" value={metrics.pedestrianTime} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-surface-muted px-3.5 py-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-surface text-foreground">
            <Car className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">Ego</div>
            <div className="font-mono text-[15px] font-medium tabular-nums">{brief.egoSpeed}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-surface-muted px-3.5 py-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-surface text-foreground">
            <User className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">Pedestrian</div>
            <div className="font-mono text-[15px] font-medium tabular-nums">{brief.pedestrianSpeed}</div>
          </div>
        </div>
      </div>

      <p className="mt-4 border-t border-border/70 pt-3 text-xs text-muted-foreground">
        {brief.context}
      </p>
    </Card>
  );
}
