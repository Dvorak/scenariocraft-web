import { AnimatePresence, motion } from "framer-motion";
import {
  FileText,
  Box,
  Play,
  ShieldCheck,
  BarChart3,
  Award,
  Wrench,
  MessageSquare,
} from "lucide-react";
import {
  buildArtifacts,
  checks,
  externalEvidence,
  metrics,
  openScenarioXmlSample,
  repairTrace,
  runArtifacts,
  scenarioSpecSample,
  specRows,
  type StageId,
} from "@/lib/scenariocraft/mockData";
import { useScenarioStore } from "@/lib/scenariocraft/store";
import { Card, KeyValueRow, MetricTile, StatusDot } from "../primitives";

export function StageDetail() {
  const active = useScenarioStore((s) => s.activeStage);
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)]">
      <div className="flex flex-col gap-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col gap-5"
          >
            <PrimaryForStage stage={active} />
          </motion.div>
        </AnimatePresence>

        <div className="grid gap-5 md:grid-cols-2">
          <EvidenceCard />
          <RepairTraceCard />
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <ChecksCard />
        <MetricsCard />
      </div>
    </div>
  );
}

function PrimaryForStage({ stage }: { stage: StageId }) {
  switch (stage) {
    case "intent":
      return <IntentCard />;
    case "spec":
      return <SpecCard />;
    case "build":
      return <BuildCard />;
    case "checks":
      return <ChecksDetailCard />;
    case "metrics":
      return <MetricsDetailCard />;
    case "quality":
      return <QualityCard />;
    case "simulation":
      return <SimulationCard />;
    case "repair":
      return <RepairDetailCard />;
  }
}

function IntentCard() {
  const request = useScenarioStore((s) => s.request);
  return (
    <Card title="Intent & Spec" icon={<MessageSquare className="h-4 w-4" />}>
      <p className="mb-4 rounded-lg border border-border/70 bg-surface-muted p-3.5 text-sm leading-relaxed text-foreground">
        {request}
      </p>
      <div className="space-y-2">
        <KeyValueRow label="Intent source" value="Demo case / mock path" />
        <KeyValueRow label="ScenarioSpec" value="Available" />
        <KeyValueRow label="Template resolution" value="Seed 101" />
      </div>
    </Card>
  );
}

function SpecCard() {
  return (
    <Card title="ScenarioSpec" icon={<FileText className="h-4 w-4" />}>
      <div className="space-y-2">
        {specRows.map((r) => (
          <KeyValueRow key={r.label} label={<span className="font-mono text-[12.5px]">{r.label}</span>} value={<span className="font-mono text-[12.5px]">{r.value}</span>} />
        ))}
      </div>
      <div className="mt-4 overflow-hidden rounded-xl border border-border/70">
        <div className="border-b border-border/70 bg-surface-muted px-3.5 py-2 text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
          scenariospec.json
        </div>
        <pre className="max-h-64 overflow-auto bg-surface p-3.5 font-mono text-[12px] leading-relaxed text-foreground">
{scenarioSpecSample}
        </pre>
      </div>
    </Card>
  );
}

function BuildCard() {
  return (
    <Card title="Build Artifacts" icon={<Box className="h-4 w-4" />}>
      <div className="space-y-2">
        {buildArtifacts.map((a) => (
          <KeyValueRow
            key={a.label}
            label={<span className="flex items-center gap-2"><span className="rounded bg-surface-muted px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">{a.kind}</span>{a.label}</span>}
            value={<span className="font-mono text-[12.5px]">{a.value}</span>}
            chevron
          />
        ))}
      </div>
      <div className="mt-4 overflow-hidden rounded-xl border border-border/70">
        <div className="border-b border-border/70 bg-surface-muted px-3.5 py-2 text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
          OpenSCENARIO XML
        </div>
        <pre className="max-h-64 overflow-auto bg-surface p-3.5 font-mono text-[12px] leading-relaxed text-foreground">
{openScenarioXmlSample}
        </pre>
      </div>
    </Card>
  );
}

function ChecksDetailCard() {
  return (
    <Card title="Checks" icon={<ShieldCheck className="h-4 w-4" />}>
      <p className="mb-3 text-xs text-muted-foreground">
        Structural, geometry, intent alignment, and artifact consistency evidence.
      </p>
      <ul className="space-y-2">
        {checks.map((c) => (
          <li key={c.label} className="flex items-center justify-between gap-4 rounded-lg border border-border/70 bg-surface-muted px-3.5 py-3 text-sm">
            <div className="flex items-center gap-3">
              <StatusDot status={c.status} />
              <span className="font-medium">{c.label}</span>
            </div>
            <span className={`text-xs font-semibold uppercase tracking-wide ${c.status === "warning" ? "text-warning" : "text-success"}`}>
              {c.status === "warning" ? "Warning" : "Passed"}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function MetricsDetailCard() {
  return (
    <Card title="Metrics" icon={<BarChart3 className="h-4 w-4" />}>
      <p className="mb-3 text-xs text-muted-foreground">Timing, TTC, THW, and criticality measurements.</p>
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3">
        <MetricTile label="Target TTC" value={metrics.targetTTC} tone="coral" />
        <MetricTile label="Lead Time" value={metrics.leadTime} />
        <MetricTile label="Trigger Threshold" value={metrics.triggerThreshold} />
        <MetricTile label="Pedestrian Time" value={metrics.pedestrianTime} />
        <MetricTile label="THW" value={metrics.thw} />
        <MetricTile label="Ego speed" value="35 km/h" />
      </div>
    </Card>
  );
}

function QualityCard() {
  return (
    <Card title="Quality — ASAM QC" icon={<Award className="h-4 w-4" />}>
      <div className="space-y-2">
        <KeyValueRow label="Rule coverage" value="42 / 42" />
        <KeyValueRow label="Errors" value="0" />
        <KeyValueRow label="Warnings" value="1" />
        <KeyValueRow label="Report" value={<span className="font-mono text-[12.5px]">osc_quality_report.xml</span>} chevron />
      </div>
    </Card>
  );
}

function SimulationCard() {
  return (
    <Card title="Run Artifacts" icon={<Play className="h-4 w-4" />}>
      <div className="space-y-2">
        {runArtifacts.map((r) => (
          <KeyValueRow key={r.label} label={r.label} value={<span className="font-mono text-[12.5px]">{r.value}</span>} chevron />
        ))}
      </div>
      <div className="mt-4 overflow-hidden rounded-xl border border-border/70">
        <div className="border-b border-border/70 bg-surface-muted px-3.5 py-2 text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
          esmini.log (tail)
        </div>
        <pre className="max-h-56 overflow-auto bg-surface p-3.5 font-mono text-[11.5px] leading-relaxed text-muted-foreground">
{`[00:04.45] entity[0] ego  v=41.06 km/h  s=83.26 m
[00:04.60] trigger armed (ttc=1.90 s)
[00:05.12] pedestrian visible
[00:06.00] ego brake demand 5.4 m/s^2
[00:07.35] min ttc reached: 1.677 s`}
        </pre>
      </div>
    </Card>
  );
}

function RepairDetailCard() {
  return (
    <Card title="Patch Repair Trace" icon={<Wrench className="h-4 w-4" />}>
      <div className="space-y-2">
        {repairTrace.map((r) => (
          <KeyValueRow key={r.label} label={r.label} value={<span className="font-mono text-[12.5px]">{r.value}</span>} />
        ))}
      </div>
      <div className="mt-4 rounded-xl border border-dashed border-coral/40 bg-coral-soft p-4 text-sm text-foreground">
        <div className="font-semibold">Suggested patch</div>
        <p className="mt-1 text-muted-foreground">
          Reposition parked_van by +0.42 m lateral so its footprint sits inside the ego-side parking strip and occludes the pedestrian at t=0.
        </p>
      </div>
    </Card>
  );
}

function ChecksCard() {
  return (
    <Card title="Checks" icon={<ShieldCheck className="h-4 w-4" />}>
      <ul className="space-y-2">
        {checks.map((c) => (
          <li key={c.label} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
              {c.label}
            </span>
            <span className="flex items-center gap-2 font-medium">
              <StatusDot status={c.status} />
              <span className={c.status === "warning" ? "text-warning" : "text-success"}>
                {c.status === "warning" ? "Warning" : "Passed"}
              </span>
            </span>
          </li>
        ))}
      </ul>
      <button className="mt-4 flex w-full items-center justify-between text-xs font-medium text-muted-foreground hover:text-foreground">
        View all checks
        <span aria-hidden>›</span>
      </button>
    </Card>
  );
}

function MetricsCard() {
  return (
    <Card title="Metrics" icon={<BarChart3 className="h-4 w-4" />}>
      <div className="grid grid-cols-2 gap-2.5">
        <MetricTile label="Target TTC" value={metrics.targetTTC} tone="coral" />
        <MetricTile label="Lead Time" value={metrics.leadTime} />
        <MetricTile label="Trigger Threshold" value={metrics.triggerThreshold} />
        <MetricTile label="Pedestrian Time" value={metrics.pedestrianTime} />
        <div className="col-span-2">
          <MetricTile label="THW" value={metrics.thw} />
        </div>
      </div>
      <button className="mt-4 flex w-full items-center justify-between text-xs font-medium text-muted-foreground hover:text-foreground">
        View all metrics
        <span aria-hidden>›</span>
      </button>
    </Card>
  );
}

function EvidenceCard() {
  return (
    <Card title="External Evidence" icon={<ShieldCheck className="h-4 w-4" />}>
      <ul className="space-y-3">
        {externalEvidence.map((e) => (
          <li key={e.label} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{e.label}</span>
            <span className="flex items-center gap-2 font-medium">
              <StatusDot status={e.status} />
              <span className={e.status === "warning" ? "text-warning" : "text-success"}>{e.value}</span>
            </span>
          </li>
        ))}
      </ul>
      <button className="mt-4 flex w-full items-center justify-between text-xs font-medium text-muted-foreground hover:text-foreground">
        View all evidence
        <span aria-hidden>›</span>
      </button>
    </Card>
  );
}

function RepairTraceCard() {
  return (
    <Card title="Repair Trace" icon={<Wrench className="h-4 w-4" />}>
      <ul className="space-y-3 text-sm">
        {repairTrace.map((r) => (
          <li key={r.label} className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">{r.label}</span>
            <span className="font-mono text-[12.5px]">{r.value}</span>
          </li>
        ))}
      </ul>
      <button className="mt-4 flex w-full items-center justify-between text-xs font-medium text-muted-foreground hover:text-foreground">
        View repair trace
        <span aria-hidden>›</span>
      </button>
    </Card>
  );
}
