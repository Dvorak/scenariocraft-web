import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  BarChart3,
  Box,
  FileText,
  MessageSquare,
  Play,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { API_ORIGIN } from "@/lib/scenariocraft/api";
import {
  candidateChecks,
  humanize,
  projectWorkflowResult,
  resolveArtifactUrl,
  runtimeChecks,
} from "@/lib/scenariocraft/resultView";
import { useScenarioStore } from "@/lib/scenariocraft/store";
import type {
  CheckResult,
  JsonObject,
  StageId,
  StageStatus,
  WorkflowEnvelope,
} from "@/lib/scenariocraft/types";
import { Card, KeyValueRow, MetricTile, StatusDot } from "../primitives";

export function StageDetail() {
  const active = useScenarioStore((state) => state.activeStage);
  const workflow = useScenarioStore((state) => state.workflow);
  const error = useScenarioStore((state) => state.error);
  const repairResult = useScenarioStore((state) => state.repairResult);

  if (!workflow) {
    return (
      <Card title="Pipeline Detail">
        <div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground">
          {error ??
            "Generate a scenario to inspect typed contracts, artifacts, checks, and evidence."}
        </div>
      </Card>
    );
  }

  return (
    <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
          className="min-w-0"
        >
          <PrimaryForStage
            stage={active}
            workflow={workflow}
            repairResult={repairResult?.repair_result}
          />
        </motion.div>
      </AnimatePresence>
      <div className="flex min-w-0 flex-col gap-5">
        <RunSummary workflow={workflow} />
        <EvidenceSummary workflow={workflow} />
      </div>
    </div>
  );
}

function PrimaryForStage({
  stage,
  workflow,
  repairResult,
}: {
  stage: StageId;
  workflow: WorkflowEnvelope;
  repairResult?: JsonObject;
}) {
  const result = workflow.result;
  switch (stage) {
    case "intent":
      return (
        <DetailCard
          title="Intent"
          icon={<MessageSquare className="h-4 w-4" />}
          value={{
            request: result.request,
            intent_proposal: result.intent_proposal,
            candidate_trace: result.candidate_trace,
          }}
        />
      );
    case "spec":
      return (
        <DetailCard
          title="ScenarioSpec"
          icon={<FileText className="h-4 w-4" />}
          value={result.spec}
        />
      );
    case "build":
      return <BuildDetail workflow={workflow} />;
    case "checks":
      return <ChecksDetail workflow={workflow} />;
    case "metrics":
      return <MetricsDetail workflow={workflow} />;
    case "quality":
      return (
        <DetailCard
          title="OSC Quality"
          icon={<Award className="h-4 w-4" />}
          value={result.qc_result ?? { status: "not run" }}
        />
      );
    case "simulation":
      return <SimulationDetail workflow={workflow} />;
    case "repair":
      return (
        <DetailCard
          title="Repair"
          icon={<Wrench className="h-4 w-4" />}
          value={repairResult ?? result.prepared_case ?? { status: "No repair requested" }}
        />
      );
  }
}

function BuildDetail({ workflow }: { workflow: WorkflowEnvelope }) {
  return (
    <Card title="Build Artifacts" icon={<Box className="h-4 w-4" />}>
      <div className="space-y-2">
        {Object.entries(workflow.artifact_urls).map(([name, path]) => (
          <a
            key={name}
            href={resolveArtifactUrl(path, API_ORIGIN) ?? undefined}
            target="_blank"
            rel="noreferrer"
            className="block"
          >
            <KeyValueRow label={humanize(name)} value="Open artifact" chevron />
          </a>
        ))}
      </div>
      <JsonBlock
        label="Build result"
        value={workflow.result.build_result ?? { status: "not built" }}
      />
    </Card>
  );
}

function ChecksDetail({ workflow }: { workflow: WorkflowEnvelope }) {
  const checks = candidateChecks(workflow);
  return (
    <Card title="Checks" icon={<ShieldCheck className="h-4 w-4" />}>
      <CheckEvidenceList checks={checks} empty="No candidate check evidence was recorded." />
    </Card>
  );
}

function SimulationDetail({ workflow }: { workflow: WorkflowEnvelope }) {
  const checks = runtimeChecks(workflow);
  return (
    <Card title="Simulation" icon={<Play className="h-4 w-4" />}>
      <CheckEvidenceList
        checks={checks}
        empty="No runtime consistency evidence was recorded."
        severityAware
      />
      <JsonBlock
        label="Runtime artifacts"
        value={{
          esmini: workflow.result.esmini_result,
          playback: workflow.result.playback_result,
        }}
      />
    </Card>
  );
}

function CheckEvidenceList({
  checks,
  empty,
  severityAware = false,
}: {
  checks: CheckResult[];
  empty: string;
  severityAware?: boolean;
}) {
  if (!checks.length) return <p className="text-sm text-muted-foreground">{empty}</p>;

  return (
    <div className="space-y-2">
      {checks.map((check, index) => {
        const status = checkStatus(check, severityAware);
        return (
          <div
            key={check.name ?? index}
            className="flex items-start justify-between gap-4 rounded-xl border border-border/70 bg-surface-muted px-3.5 py-3 text-sm"
          >
            <div className="min-w-0">
              <div className="font-medium">{humanize(check.name ?? `check ${index + 1}`)}</div>
              {check.message && (
                <div className="mt-1 text-xs text-muted-foreground">{check.message}</div>
              )}
            </div>
            <span className="flex shrink-0 items-center gap-1.5 text-xs font-semibold">
              <StatusDot status={status} />
              {humanize(status)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function checkStatus(check: CheckResult, severityAware: boolean): StageStatus {
  if (check.passed !== false) return "passed";
  if (severityAware && check.severity !== "failure") return "warning";
  return "failed";
}

function MetricsDetail({ workflow }: { workflow: WorkflowEnvelope }) {
  const entries = metricEntries(workflow);
  return (
    <Card title="Metrics & Parameters" icon={<BarChart3 className="h-4 w-4" />}>
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3">
        {entries.length ? (
          entries.map(([label, value], index) => (
            <MetricTile
              key={label}
              label={humanize(label)}
              value={formatMetric(value)}
              tone={index === 0 ? "coral" : "default"}
            />
          ))
        ) : (
          <p className="col-span-full text-sm text-muted-foreground">
            No numeric metrics were recorded.
          </p>
        )}
      </div>
    </Card>
  );
}

function RunSummary({ workflow }: { workflow: WorkflowEnvelope }) {
  const view = projectWorkflowResult(workflow);
  const trace = workflow.result.execution_trace;
  const usage = trace?.provider_usage;
  return (
    <Card title="Run" icon={<Play className="h-4 w-4" />}>
      <div className="space-y-2">
        <KeyValueRow
          label="Run ID"
          value={<span className="font-mono text-xs">{workflow.run_id}</span>}
        />
        <KeyValueRow
          label="Terminal status"
          value={humanize(workflow.result.status.terminal_status)}
        />
        <KeyValueRow label="Family" value={view.brief.family} />
        <KeyValueRow label="Artifacts" value={String(Object.keys(workflow.artifact_urls).length)} />
        <KeyValueRow
          label="Total duration"
          value={trace ? `${(trace.total_duration_ms / 1000).toFixed(1)} s` : "n/a"}
        />
        <KeyValueRow
          label="Provider"
          value={usage ? `${usage.provider_name} · ${usage.model}` : "deterministic"}
        />
        <KeyValueRow
          label="Tokens"
          value={
            usage?.total_tokens == null
              ? "unavailable"
              : `${usage.total_tokens.toLocaleString()}${usage.local ? " · local" : ""}`
          }
        />
      </div>
      {trace && (
        <div className="mt-3 space-y-1.5 border-t border-border/70 pt-3">
          {trace.stages.map((stage) => (
            <div
              key={stage.stage}
              className="flex items-center justify-between gap-3 text-xs text-muted-foreground"
            >
              <span className="truncate">{humanize(stage.stage)}</span>
              <span className="shrink-0 font-mono tabular-nums">
                {stage.duration_ms == null ? "—" : `${stage.duration_ms} ms`}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function EvidenceSummary({ workflow }: { workflow: WorkflowEnvelope }) {
  const stages = projectWorkflowResult(workflow).stages;
  const rows = [
    ["Checks", stages.checks],
    ["OSC Quality", stages.quality],
    ["Simulation", stages.simulation],
    ["Repair", stages.repair],
  ] as const;
  return (
    <Card title="Evidence" icon={<ShieldCheck className="h-4 w-4" />}>
      <div className="space-y-3">
        {rows.map(([label, status]) => (
          <div key={label} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="flex items-center gap-1.5 font-medium">
              <StatusDot status={status} />
              {humanize(status)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function DetailCard({
  title,
  icon,
  value,
}: {
  title: string;
  icon: React.ReactNode;
  value: unknown;
}) {
  return (
    <Card title={title} icon={icon}>
      <JsonBlock label={title} value={value} flush />
    </Card>
  );
}

function JsonBlock({
  label,
  value,
  flush = false,
}: {
  label: string;
  value: unknown;
  flush?: boolean;
}) {
  return (
    <div className={`${flush ? "" : "mt-4 "}overflow-hidden rounded-xl border border-border/70`}>
      <div className="border-b border-border/70 bg-surface-muted px-3.5 py-2 text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </div>
      <pre className="max-h-[560px] overflow-auto bg-surface p-3.5 font-mono text-[12px] leading-relaxed text-foreground">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

function metricEntries(workflow: WorkflowEnvelope): [string, unknown][] {
  const criticality = workflow.result.spec.intended_criticality ?? {};
  const resolved = workflow.result.candidate_trace?.resolved_parameters ?? {};
  const entries: [string, unknown][] = [];
  for (const [name, value] of Object.entries(criticality)) {
    if (typeof value === "number") entries.push([name, value]);
  }
  for (const [name, detail] of Object.entries(resolved)) {
    const value = (detail as JsonObject).value;
    if (typeof value === "number" && !entries.some(([existing]) => existing === name))
      entries.push([name, value]);
  }
  return entries.slice(0, 12);
}

function formatMetric(value: unknown): string {
  return typeof value === "number" ? Number(value.toFixed(3)).toString() : String(value ?? "n/a");
}
