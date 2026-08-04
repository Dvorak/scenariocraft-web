import {
  AlertTriangle,
  Bot,
  ExternalLink,
  GitBranch,
  LoaderCircle,
  MessageSquareText,
  Play,
  RotateCw,
  Shuffle,
  Sparkles,
  UserRound,
} from "lucide-react";
import { motion } from "framer-motion";
import { STAGES, humanize, projectWorkflowResult } from "@/lib/scenariocraft/resultView";
import { useScenarioStore } from "@/lib/scenariocraft/store";
import type {
  ExecutionStage,
  ProviderUsage,
  RunProgress,
  StageStatus,
  WorkflowEnvelope,
} from "@/lib/scenariocraft/types";
import { Card, StatusDot } from "../primitives";
import { RepairAlert } from "../panels/RepairAlert";

export function ScenarioThread() {
  const request = useScenarioStore((state) => state.request);
  const workflow = useScenarioStore((state) => state.workflow);
  const running = useScenarioStore((state) => state.running);
  const revising = useScenarioStore((state) => state.revising);
  const suggesting = useScenarioStore((state) => state.suggesting);
  const runProgress = useScenarioStore((state) => state.runProgress);
  const outcome = useScenarioStore((state) => state.outcome);
  const error = useScenarioStore((state) => state.error);
  const revisionRequest = useScenarioStore((state) => state.revisionRequest);
  const capabilities = useScenarioStore((state) => state.capabilities);
  const llm = capabilities?.providers.llm;
  const revisionTrace = workflow?.result.revision_trace;

  const initialRequest =
    typeof workflow?.result.request.scenario_text === "string"
      ? workflow.result.request.scenario_text
      : request;

  return (
    <Card
      title="Session"
      icon={<MessageSquareText className="h-4 w-4" />}
      action={<ProviderIdentity />}
      padded={false}
      bodyClassName="grid min-h-0 grid-rows-[minmax(0,1fr)_auto]"
      className="grid min-h-[700px] grid-rows-[auto_minmax(0,1fr)] xl:h-full xl:min-h-0"
    >
      <div className="min-h-0 overflow-y-auto px-4 py-4 sm:px-5">
        <div className="space-y-4">
          {(workflow || running) && initialRequest && (
            <UserTurn text={initialRequest} label="Request" />
          )}

          {workflow && !revisionTrace && (
            <SystemTurn
              title={workflowTitle(workflow)}
              detail={workflowDetail(workflow)}
              status={workflowStatus(workflow)}
              stages={completedStages(workflow)}
              usage={workflow.result.execution_trace?.provider_usage}
            />
          )}

          {revisionTrace?.revision_request && (
            <UserTurn text={revisionTrace.revision_request} label="Revision" />
          )}

          {revisionTrace && !revising && (
            <SystemTurn
              title="Revision applied"
              detail={`${revisionTrace.changes.length} change${
                revisionTrace.changes.length === 1 ? "" : "s"
              } accepted as a same-family variant.`}
              status="passed"
              stages={completedStages(workflow)}
              usage={workflow?.result.execution_trace?.provider_usage}
            />
          )}

          {running && !workflow && (
            <SystemTurn
              title="Creating candidate"
              detail={runProgress?.detail ?? "Resolving the scenario request."}
              status="running"
              stages={progressStages(runProgress)}
              usage={runProgress?.provider_usage}
            />
          )}

          {revising && (
            <>
              {revisionRequest && <UserTurn text={revisionRequest} label="Revision" />}
              <SystemTurn
                title="Creating revised candidate"
                detail={runProgress?.detail ?? "Resolving the revision request."}
                status="running"
                stages={progressStages(runProgress)}
                usage={runProgress?.provider_usage}
              />
            </>
          )}

          {(outcome || error) && !running && !revising && (
            <AttentionTurn
              title={humanize(outcome?.status ?? "Request needs attention")}
              detail={
                outcome?.clarification_question ??
                outcome?.message ??
                outcome?.rationale ??
                outcome?.refusal_reason ??
                error ??
                "The request was not accepted."
              }
              nearest={outcome?.nearest_template_candidates}
            />
          )}

          <RepairAlert embedded />

          {!workflow && !running && !outcome && !error && (
            <div className="flex min-h-48 items-center justify-center px-6 text-center text-xs leading-relaxed text-muted-foreground">
              Describe a scenario below. ScenarioCraft will show intent, build, checks, and runtime
              evidence here.
            </div>
          )}
        </div>
      </div>

      <ThreadComposer
        hasWorkflow={Boolean(workflow)}
        llmReady={llm?.configured === true}
        busy={running || revising}
        suggesting={suggesting}
      />
    </Card>
  );
}

function UserTurn({ text, label }: { text: string; label: string }) {
  return (
    <div className="grid grid-cols-[30px_minmax(0,1fr)] gap-2.5">
      <div className="grid h-[30px] w-[30px] place-items-center rounded-lg bg-primary text-primary-foreground">
        <UserRound className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0">
        <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </div>
        <div className="rounded-[4px_12px_12px_12px] border border-border bg-surface-muted px-3.5 py-3 text-[13px] leading-relaxed">
          {text}
        </div>
      </div>
    </div>
  );
}

function SystemTurn({
  title,
  detail,
  status,
  stages,
  usage,
}: {
  title: string;
  detail: string;
  status: StageStatus;
  stages: ExecutionStage[];
  usage: ProviderUsage | null | undefined;
}) {
  return (
    <div className="grid grid-cols-[30px_minmax(0,1fr)] gap-2.5">
      <div className="grid h-[30px] w-[30px] place-items-center rounded-lg border border-coral/20 bg-coral-soft text-coral">
        <Bot className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0">
        <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          ScenarioCraft
        </div>
        <div className="overflow-hidden rounded-[4px_12px_12px_12px] border border-border bg-surface">
          <div className="flex items-start justify-between gap-3 px-3.5 py-3">
            <div className="min-w-0">
              <div className="text-xs font-semibold">{title}</div>
              <div className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">
                {detail}
              </div>
            </div>
            <span className={statusBadgeClass(status)}>
              {status === "running" ? "Running" : status === "failed" ? "Rejected" : "Accepted"}
            </span>
          </div>
          <div className="border-t border-border/70 px-3.5 py-2.5">
            {stages.map((stage) => (
              <div
                key={stage.stage}
                className={`grid min-h-6 grid-cols-[14px_minmax(0,1fr)_auto] items-center gap-2 text-[10px] ${
                  stage.status === "running"
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                <StatusDot status={stage.status} className="h-1.5 w-1.5" />
                <span className="truncate">{stage.detail}</span>
                <span className="font-mono text-[9px] tabular-nums">
                  {formatDuration(stage.duration_ms)}
                </span>
              </div>
            ))}
            {usage && (
              <div className="mt-1.5 flex items-center justify-between gap-3 border-t border-border/60 pt-2 text-[9px] text-muted-foreground">
                <span className="truncate">
                  {usage.local ? "Local model" : "Provider"} · {usage.model}
                </span>
                <span className="shrink-0 font-mono tabular-nums">
                  {usage.total_tokens == null
                    ? "tokens unavailable"
                    : `${usage.total_tokens} tokens`}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AttentionTurn({
  title,
  detail,
  nearest,
}: {
  title: string;
  detail: string;
  nearest: string[] | undefined;
}) {
  const helpUrl = providerHelpUrl(detail);
  const visibleDetail = helpUrl ? detail.replace(` See ${helpUrl}`, "").trim() : detail;
  return (
    <div className="grid grid-cols-[30px_minmax(0,1fr)] gap-2.5">
      <div className="grid h-[30px] w-[30px] place-items-center rounded-lg bg-warning/10 text-warning">
        <AlertTriangle className="h-3.5 w-3.5" />
      </div>
      <div className="rounded-[4px_12px_12px_12px] border border-warning/25 bg-warning/10 px-3.5 py-3">
        <div className="text-xs font-semibold">{title}</div>
        <div className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
          {visibleDetail}
        </div>
        {helpUrl && (
          <a
            className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-foreground underline decoration-border-strong underline-offset-2"
            href={helpUrl}
            target="_blank"
            rel="noreferrer"
          >
            View provider error guide
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
        {!!nearest?.length && (
          <div className="mt-2 text-[10px] text-muted-foreground">
            Nearest families: {nearest.map(humanize).join(", ")}
          </div>
        )}
      </div>
    </div>
  );
}

function providerHelpUrl(detail: string): string | null {
  const urls = detail.match(/https:\/\/[^\s]+/g) ?? [];
  const preferred = urls.find(
    (url) => url.includes("api-docs.deepseek.com") || url.includes("help.openai.com"),
  );
  return (preferred ?? urls[0] ?? "").replace(/[.,;:)]+$/, "") || null;
}

function ThreadComposer({
  hasWorkflow,
  llmReady,
  busy,
  suggesting,
}: {
  hasWorkflow: boolean;
  llmReady: boolean;
  busy: boolean;
  suggesting: boolean;
}) {
  const request = useScenarioStore((state) => state.request);
  const revisionRequest = useScenarioStore((state) => state.revisionRequest);
  const provider = useScenarioStore((state) => state.provider);
  const selectedCaseId = useScenarioStore((state) => state.selectedCaseId);
  const capabilities = useScenarioStore((state) => state.capabilities);
  const initializing = useScenarioStore((state) => state.initializing);
  const setRequest = useScenarioStore((state) => state.setRequest);
  const setRevisionRequest = useScenarioStore((state) => state.setRevisionRequest);
  const setProvider = useScenarioStore((state) => state.setProvider);
  const setControlledCase = useScenarioStore((state) => state.setControlledCase);
  const shufflePrompt = useScenarioStore((state) => state.shufflePrompt);
  const suggestIdea = useScenarioStore((state) => state.suggestIdea);
  const generate = useScenarioStore((state) => state.generate);
  const revise = useScenarioStore((state) => state.revise);
  const reset = useScenarioStore((state) => state.reset);
  const llm = capabilities?.providers.llm;
  const value = hasWorkflow ? revisionRequest : request;
  const canSubmit = hasWorkflow
    ? Boolean(revisionRequest.trim()) && llmReady
    : Boolean(request.trim()) && (provider !== "llm" || llmReady);

  return (
    <div className="border-t border-border/70 bg-surface-muted/55 p-3.5">
      <div className="rounded-xl border border-border-strong bg-surface p-3 shadow-[0_8px_24px_-24px_rgba(20,20,20,.5)]">
        <textarea
          value={value}
          onChange={(event) =>
            hasWorkflow ? setRevisionRequest(event.target.value) : setRequest(event.target.value)
          }
          rows={hasWorkflow ? 2 : 4}
          disabled={busy || suggesting || initializing}
          className="w-full resize-none border-0 bg-transparent text-[13px] leading-relaxed outline-none placeholder:text-muted-foreground/70 disabled:opacity-60"
          placeholder={
            hasWorkflow
              ? llmReady
                ? "Describe a revision, for example: shorter gap or add two background vehicles…"
                : "Configure an LLM to describe a revision, or use Adjust for direct edits."
              : initializing
                ? "Connecting to ScenarioCraft…"
                : "Describe a driving scenario…"
          }
        />

        <div className="mt-2 flex items-end justify-between gap-3">
          <div className="min-w-0 flex-1">
            {hasWorkflow ? (
              <div className="min-h-8 min-w-0" />
            ) : (
              <div className="grid grid-cols-[104px_minmax(0,1fr)_34px] items-center gap-2">
                <select
                  value={provider}
                  aria-label="Provider"
                  onChange={(event) => setProvider(event.target.value as typeof provider)}
                  className="h-8 min-w-0 rounded-lg border border-border bg-surface px-2.5 text-[11px] font-semibold outline-none focus:border-coral/40 focus:ring-2 focus:ring-coral/20"
                >
                  <option value="controlled_case">Demo</option>
                  <option value="llm">LLM</option>
                </select>

                {provider === "controlled_case" ? (
                  <select
                    value={selectedCaseId ?? ""}
                    aria-label="Controlled case"
                    onChange={(event) => setControlledCase(event.target.value)}
                    className="h-8 min-w-0 rounded-lg border border-border bg-surface px-2.5 text-[11px] font-medium outline-none focus:border-coral/40 focus:ring-2 focus:ring-coral/20"
                  >
                    {capabilities?.controlled_cases.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.display_name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="flex h-8 min-w-0 items-center rounded-lg border border-border bg-surface-muted px-2.5 text-[10px] text-muted-foreground">
                    <span className="truncate">
                      {llmReady
                        ? `${llm?.display_name ?? "LLM"} · ${llm?.selected_model ?? "model ready"}`
                        : (llm?.message ?? "LLM unavailable")}
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() =>
                    void (provider === "controlled_case" ? shufflePrompt() : suggestIdea())
                  }
                  disabled={busy || suggesting || (provider === "llm" && !llmReady)}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-surface text-muted-foreground transition-colors hover:text-foreground"
                  title={
                    provider === "controlled_case"
                      ? "Try another prompt"
                      : "Ask the configured LLM for a scenario idea"
                  }
                  aria-label={
                    provider === "controlled_case" ? "Try another prompt" : "Suggest a scenario"
                  }
                >
                  {provider === "controlled_case" ? (
                    <Shuffle className="h-3.5 w-3.5" />
                  ) : suggesting ? (
                    <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            )}
          </div>

          <motion.button
            type="button"
            onClick={() => void (hasWorkflow ? revise() : generate())}
            disabled={busy || suggesting || !canSubmit}
            whileTap={{ scale: 0.96 }}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-40"
            title={hasWorkflow ? "Create variant" : "Generate scenario"}
            aria-label={hasWorkflow ? "Create variant" : "Generate scenario"}
          >
            {busy ? (
              <LoaderCircle className="h-[18px] w-[18px] animate-spin" />
            ) : hasWorkflow ? (
              <GitBranch className="h-[18px] w-[18px]" />
            ) : (
              <Play className="h-[18px] w-[18px] fill-current" />
            )}
          </motion.button>

          {hasWorkflow && (
            <button
              type="button"
              onClick={reset}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border bg-surface text-muted-foreground transition-colors hover:text-foreground"
              title="Start a new scenario"
              aria-label="Start a new scenario"
            >
              <RotateCw className="h-[17px] w-[17px]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ProviderIdentity() {
  const workflow = useScenarioStore((state) => state.workflow);
  const runProgress = useScenarioStore((state) => state.runProgress);
  const ideaUsage = useScenarioStore((state) => state.ideaUsage);
  const llm = useScenarioStore((state) => state.capabilities?.providers.llm);
  const usage =
    runProgress?.provider_usage ??
    workflow?.result.execution_trace?.provider_usage ??
    ideaUsage ??
    null;
  const providerName = usage
    ? (llm?.display_name ?? (usage.local ? "Local LLM" : usage.provider_name))
    : (llm?.display_name ?? "LLM");
  const compactProviderName = humanizeProviderName(providerName);
  const compactUsage = usage?.total_tokens == null ? null : compactTokenCount(usage.total_tokens);
  const tooltip = usage
    ? [
        `${providerName} · ${usage.model}`,
        usage.input_tokens == null ? null : `Input ${usage.input_tokens.toLocaleString()}`,
        usage.output_tokens == null ? null : `Output ${usage.output_tokens.toLocaleString()}`,
        usage.total_tokens == null
          ? "Tokens unavailable"
          : `Total ${usage.total_tokens.toLocaleString()} tokens`,
      ]
        .filter(Boolean)
        .join(" · ")
    : llm?.configured
      ? `${providerName} · ${llm.selected_model ?? "model ready"}`
      : "Deterministic controlled case";
  return (
    <div
      className="flex min-w-0 items-center gap-2 text-[10px] text-muted-foreground"
      title={tooltip}
      aria-label={tooltip}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
      <span className="max-w-32 truncate sm:max-w-48">
        {usage
          ? `${compactProviderName}${compactUsage ? ` · ${compactUsage}` : ""}`
          : llm?.configured
            ? `${compactProviderName} · ready`
            : "deterministic demo"}
      </span>
    </div>
  );
}

function humanizeProviderName(value: string): string {
  const normalized = value.trim().replaceAll("_", " ");
  if (!normalized) return "LLM";
  const knownProviderNames: Record<string, string> = {
    deepseek: "DeepSeek",
    ollama: "Ollama",
    openai: "OpenAI",
    "local llm": "Local LLM",
  };
  const knownName = knownProviderNames[normalized.toLowerCase()];
  if (knownName) return knownName;
  return normalized
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function compactTokenCount(value: number): string {
  if (value < 1_000) return `${value} tokens`;
  if (value < 1_000_000) {
    const precision = value < 10_000 ? 1 : 0;
    return `${(value / 1_000).toFixed(precision).replace(/\.0$/, "")}k tokens`;
  }
  const precision = value < 10_000_000 ? 1 : 0;
  return `${(value / 1_000_000).toFixed(precision).replace(/\.0$/, "")}m tokens`;
}

function completedStages(workflow: WorkflowEnvelope | null): ExecutionStage[] {
  const trace = workflow?.result.execution_trace?.stages;
  if (trace?.length) return trace.filter((stage) => stage.stage !== "metrics");
  if (!workflow) return [];
  const projected = projectWorkflowResult(workflow).stages;
  return STAGES.filter((stage) =>
    ["intent", "spec", "build", "checks", "quality", "simulation"].includes(stage.id),
  ).map((stage) => ({
    stage: stage.id,
    status: projected[stage.id],
    detail: `${stage.label} ${projected[stage.id] === "passed" ? "passed" : projected[stage.id]}`,
    duration_ms: null,
  }));
}

function progressStages(progress: RunProgress | null): ExecutionStage[] {
  if (!progress) {
    return [
      {
        stage: "intent",
        status: "running",
        detail: "Starting workflow",
        duration_ms: null,
      },
    ];
  }
  const ordered = STAGES.filter((stage) =>
    ["intent", "spec", "build", "checks", "quality", "simulation"].includes(stage.id),
  )
    .map((stage) => {
      const detail = progress.stages[stage.id];
      if (!detail) return null;
      return {
        stage: stage.id,
        status: detail.status,
        detail: detail.detail,
        duration_ms: detail.duration_ms,
      };
    })
    .filter((stage): stage is ExecutionStage => stage !== null);
  if (ordered.length) return ordered;
  return [
    {
      stage: progress.active_stage ?? "intent",
      status: "running",
      detail: progress.detail,
      duration_ms: progress.elapsed_ms,
    },
  ];
}

function workflowTitle(workflow: WorkflowEnvelope): string {
  const family =
    workflow.result.candidate_trace?.template_id ??
    workflow.result.spec.scenario_type ??
    "scenario";
  return `${humanize(family)} ${
    workflow.result.candidate_trace?.acceptance_status === "rejected" ? "rejected" : "accepted"
  }`;
}

function workflowDetail(workflow: WorkflowEnvelope): string {
  return workflow.result.status.terminal_reason || "Scenario artifacts and evidence are available.";
}

function workflowStatus(workflow: WorkflowEnvelope): StageStatus {
  return workflow.result.candidate_trace?.acceptance_status === "rejected" ? "failed" : "passed";
}

function statusBadgeClass(status: StageStatus): string {
  const tone =
    status === "passed"
      ? "bg-success/10 text-success"
      : status === "running"
        ? "bg-warning/10 text-warning"
        : "bg-destructive/10 text-destructive";
  return `shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${tone}`;
}

function formatDuration(value: number | null | undefined): string {
  return value == null ? "" : `${(value / 1000).toFixed(1)} s`;
}
