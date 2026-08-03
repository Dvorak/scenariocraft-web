import { LoaderCircle, Play, RotateCcw } from "lucide-react";
import { humanize } from "@/lib/scenariocraft/resultView";
import { useScenarioStore } from "@/lib/scenariocraft/store";
import type { ParameterDomain } from "@/lib/scenariocraft/types";

export function RevisionParameterControls() {
  const workflow = useScenarioStore((state) => state.workflow);
  const capabilities = useScenarioStore((state) => state.capabilities);
  const revisionParameters = useScenarioStore((state) => state.revisionParameters);
  const setRevisionParameter = useScenarioStore((state) => state.setRevisionParameter);
  const clearRevisionParameters = useScenarioStore((state) => state.clearRevisionParameters);
  const revise = useScenarioStore((state) => state.revise);
  const revising = useScenarioStore((state) => state.revising);
  const runProgress = useScenarioStore((state) => state.runProgress);
  const outcome = useScenarioStore((state) => state.outcome);
  if (!workflow) {
    return (
      <div className="flex min-h-40 items-center justify-center px-6 text-center text-xs text-muted-foreground">
        Generate an accepted scenario before adjusting its declared parameters.
      </div>
    );
  }

  const family = workflow.result.spec.scenario_type ?? "";
  const capability = capabilities?.revision_capabilities[family];
  const currentValues = workflow.result.candidate_trace?.resolved_parameters ?? {};
  const trace = workflow.result.revision_trace;
  const hasParameters = Object.keys(revisionParameters).length > 0;

  if (!capability) {
    return (
      <div className="flex min-h-40 items-center justify-center px-6 text-center text-xs text-muted-foreground">
        Direct parameter revision is unavailable for this scenario family.
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {capability.parameter_domains.map((domain) => (
            <ParameterControl
              key={domain.name}
              domain={domain}
              current={currentValues[domain.name]?.value ?? domain.default}
              edited={revisionParameters[domain.name]}
              onChange={(value) => setRevisionParameter(domain.name, value)}
            />
          ))}
          <ParameterControl
            domain={{
              name: "ambient_vehicle_count",
              kind: "int",
              default: ambientCount(workflow.result.spec.actors),
              min_value: capability.ambient_vehicle_count.min_value,
              max_value: capability.ambient_vehicle_count.max_value,
              user_settable: true,
              description: "Explicit non-conflict background vehicles",
            }}
            current={ambientCount(workflow.result.spec.actors)}
            edited={revisionParameters.ambient_vehicle_count}
            onChange={(value) => setRevisionParameter("ambient_vehicle_count", value)}
          />
          {capability.compatible_road_assets.length > 1 && (
            <label className="rounded-xl border border-border/70 bg-surface-muted px-3 py-2.5">
              <span className="block text-[9px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Road asset
              </span>
              <select
                value={String(
                  revisionParameters.road_asset_id ??
                    workflow.result.spec.metadata?.road_asset_id ??
                    capability.compatible_road_assets[0],
                )}
                onChange={(event) => setRevisionParameter("road_asset_id", event.target.value)}
                className="mt-1 h-7 w-full bg-transparent text-xs font-medium outline-none"
              >
                {capability.compatible_road_assets.map((road) => (
                  <option key={road} value={road}>
                    {humanize(road)}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      </div>

      <div className="flex min-h-12 items-center justify-between gap-3 border-t border-border/70 px-4 py-2.5">
        <div className="min-w-0 text-[10px] text-muted-foreground">
          {trace
            ? `${trace.changes.length} applied change${trace.changes.length === 1 ? "" : "s"}`
            : hasParameters
              ? `${Object.keys(revisionParameters).length} edit${
                  Object.keys(revisionParameters).length === 1 ? "" : "s"
                } · deterministic validation before build`
              : "Direct edits stay local and do not use LLM tokens."}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {hasParameters && (
            <button
              type="button"
              onClick={clearRevisionParameters}
              className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-surface text-muted-foreground transition-colors hover:text-foreground"
              title="Reset parameter edits"
              aria-label="Reset parameter edits"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => void revise()}
            disabled={revising || !hasParameters}
            className="flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-[10px] font-semibold text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          >
            {revising ? (
              <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
            {revising ? (runProgress?.detail ?? "Creating candidate…") : "Create variant"}
          </button>
        </div>
      </div>

      {outcome &&
        outcome.status &&
        !["supported", "clarification_required"].includes(outcome.status) && (
          <div className="border-t border-warning/25 bg-warning/10 px-4 py-2.5 text-[10px]">
            <span className="font-semibold">{humanize(outcome.status)}</span>
            <span className="ml-2 text-muted-foreground">
              {outcome.message ?? outcome.rationale ?? outcome.refusal_reason}
            </span>
          </div>
        )}
    </div>
  );
}

function ParameterControl({
  domain,
  current,
  edited,
  onChange,
}: {
  domain: ParameterDomain;
  current: unknown;
  edited: unknown;
  onChange: (value: unknown) => void;
}) {
  const value = edited ?? current;
  const changed = edited !== undefined;
  return (
    <label
      className={`rounded-xl border px-3 py-2.5 ${
        changed ? "border-coral/25 bg-coral-soft" : "border-border/70 bg-surface-muted"
      }`}
    >
      <span
        className="block truncate text-[9px] font-semibold uppercase tracking-[0.08em] text-muted-foreground"
        title={parameterLabel(domain)}
      >
        {parameterLabel(domain)}
        {domain.unit ? ` · ${domain.unit}` : ""}
      </span>
      {domain.kind === "str" && domain.allowed_values?.length ? (
        <select
          value={String(value)}
          onChange={(event) => onChange(event.target.value)}
          className="mt-1 h-7 w-full bg-transparent text-xs font-medium outline-none"
        >
          {domain.allowed_values.map((allowed) => (
            <option key={String(allowed)} value={String(allowed)}>
              {humanize(String(allowed))}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={domain.kind === "float" || domain.kind === "int" ? "number" : "text"}
          value={String(value ?? "")}
          min={domain.min_value}
          max={domain.max_value}
          step={domain.kind === "int" ? 1 : "any"}
          onChange={(event) =>
            onChange(
              domain.kind === "float" || domain.kind === "int"
                ? Number(event.target.value)
                : event.target.value,
            )
          }
          className="mt-1 h-7 w-full bg-transparent font-mono text-xs font-medium outline-none"
        />
      )}
      {(domain.min_value != null || domain.max_value != null) && (
        <span className="block text-[9px] text-muted-foreground">
          {domain.min_value ?? "−∞"} – {domain.max_value ?? "∞"}
        </span>
      )}
    </label>
  );
}

function ambientCount(actors: { role?: string }[] | undefined): number {
  return actors?.filter((actor) => actor.role === "ambient_vehicle").length ?? 0;
}

function parameterLabel(domain: ParameterDomain): string {
  const name = domain.unit ? domain.name.replace(/_(?:kph|mps2|mps|m|s)$/, "") : domain.name;
  return humanize(name);
}
