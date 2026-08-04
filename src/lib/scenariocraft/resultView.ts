import type { ActorSpec, CheckResult, StageId, StageStatus, WorkflowEnvelope } from "./types";

export const STAGES: { id: StageId; label: string }[] = [
  { id: "intent", label: "Intent" },
  { id: "spec", label: "Spec" },
  { id: "build", label: "Build" },
  { id: "checks", label: "Checks" },
  { id: "metrics", label: "Metrics" },
  { id: "quality", label: "Quality" },
  { id: "simulation", label: "Simulation" },
  { id: "repair", label: "Repair" },
];

export type WorkflowView = {
  stages: Record<StageId, StageStatus>;
  brief: {
    family: string;
    egoSpeed: string;
    secondaryLabel: string;
    secondaryValue: string;
    targetTtc: string;
    context: string;
  };
};

export function emptyStages(): Record<StageId, StageStatus> {
  return Object.fromEntries(STAGES.map((stage) => [stage.id, "idle"])) as Record<
    StageId,
    StageStatus
  >;
}

export function projectWorkflowResult(envelope: WorkflowEnvelope): WorkflowView {
  const result = envelope.result;
  const candidateCheckResults = candidateChecks(envelope);
  const runtimeCheckResults = runtimeChecks(envelope);
  const checkStatus = projectChecks(candidateCheckResults);
  const actors = result.spec.actors ?? [];
  const ego = actors.find((actor) => actor.role === "ego" || actor.id === "ego");
  const secondary = actors.find((actor) => actor !== ego);
  const criticality = result.spec.intended_criticality ?? {};
  const road = result.spec.road ?? {};
  const weather = result.spec.weather ?? {};

  return {
    stages: {
      intent: result.candidate_trace || result.intent_proposal || result.spec ? "passed" : "idle",
      spec: result.spec ? "passed" : "idle",
      build: result.build_result ? "passed" : terminalFailure(result.status.terminal_status),
      checks: checkStatus,
      metrics: criticality.target_min_ttc_s != null ? "passed" : "warning",
      quality: projectExternal(result.qc_result),
      simulation: projectSimulation(
        result.esmini_result,
        result.playback_result,
        runtimeCheckResults,
      ),
      repair: projectRepair(result.prepared_case),
    },
    brief: {
      family: humanize(
        result.candidate_trace?.template_id ?? result.spec.scenario_type ?? "Scenario",
      ),
      egoSpeed: actorSpeed(ego),
      secondaryLabel: humanize(secondary?.role ?? secondary?.id ?? "Other actor"),
      secondaryValue: actorSpeed(secondary),
      targetTtc: seconds(criticality.target_min_ttc_s),
      context: [
        road.type,
        road.lanes_per_direction,
        weather.condition,
        weather.road_surface,
        weather.road_condition,
      ]
        .filter((value): value is string => typeof value === "string" && Boolean(value))
        .map(humanize)
        .join(" · "),
    },
  };
}

export function resolveArtifactUrl(path: string | undefined, apiOrigin: string): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `${apiOrigin.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

function projectChecks(checks: CheckResult[]): StageStatus {
  if (checks.some((check) => check.passed === false)) return "failed";
  if (checks.length > 0) return "passed";
  return "idle";
}

function projectExternal(value: Record<string, unknown> | null | undefined): StageStatus {
  if (!value) return "idle";
  if (value.passed === true || value.succeeded === true) return "passed";
  if (value.passed === false && value.available !== false) return "failed";
  return "warning";
}

function projectSimulation(
  esmini: Record<string, unknown> | null | undefined,
  playback: Record<string, unknown> | null | undefined,
  runtimeChecks: CheckResult[],
): StageStatus {
  const executed = esmini?.esmini_available !== false && esmini?.executed !== false;
  if (
    executed &&
    runtimeChecks.some((check) => check.passed === false && check.severity === "failure")
  )
    return "failed";
  if (runtimeChecks.some((check) => check.passed === false)) return "warning";
  if (playback?.playback_is_animated === true || esmini?.succeeded === true) return "passed";
  if (playback || esmini) return "warning";
  return "idle";
}

function projectRepair(preparedCase: Record<string, unknown> | null | undefined): StageStatus {
  if (!preparedCase) return "idle";
  if (preparedCase.repair_required === true) return "warning";
  return "passed";
}

function terminalFailure(status: string): StageStatus {
  return status.includes("failed") || status === "artifact_mismatch" ? "failed" : "idle";
}

function actorSpeed(actor: ActorSpec | undefined): string {
  if (!actor) return "n/a";
  if (typeof actor.initial_speed_kph === "number")
    return `${actor.initial_speed_kph.toFixed(1)} km/h`;
  if (typeof actor.speed_mps === "number") return `${actor.speed_mps.toFixed(1)} m/s`;
  return actor.state === "parked" ? "Parked" : "n/a";
}

function seconds(value: unknown): string {
  return typeof value === "number" ? `${value.toFixed(1)} s` : "n/a";
}

export function humanize(value: string): string {
  const text = value.replaceAll("_", " ").trim();
  return text ? text[0].toUpperCase() + text.slice(1) : "n/a";
}

export function candidateChecks(envelope: WorkflowEnvelope): CheckResult[] {
  return [
    ...(envelope.result.structural_check_results ?? []),
    ...(envelope.result.family_check_results ?? []),
    ...(envelope.result.artifact_check_results ?? []),
  ];
}

export function runtimeChecks(envelope: WorkflowEnvelope): CheckResult[] {
  return envelope.result.runtime_check_results ?? [];
}

export function candidateFailures(envelope: WorkflowEnvelope): CheckResult[] {
  return candidateChecks(envelope).filter((check) => check.passed === false);
}
