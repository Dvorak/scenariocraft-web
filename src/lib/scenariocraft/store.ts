import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";
import {
  ScenarioCraftApiError,
  generateScenario,
  getCapabilities,
  repairScenario,
  reviseScenario,
  suggestScenarioIdea,
} from "./api";
import type {
  CapabilitiesResponse,
  GenerateRequest,
  IntentOutcome,
  RepairEnvelope,
  RepairProvider,
  RunProgress,
  ScenarioIdeaResponse,
  StageId,
  WorkflowEnvelope,
} from "./types";

type View = "workspace" | "advanced";
type Provider = GenerateRequest["provider"];

export type ScenarioApi = {
  getCapabilities: () => Promise<CapabilitiesResponse>;
  generateScenario: (
    request: GenerateRequest,
    onProgress?: (progress: RunProgress) => void,
  ) => Promise<WorkflowEnvelope>;
  reviseScenario: (
    request: GenerateRequest,
    onProgress?: (progress: RunProgress) => void,
  ) => Promise<WorkflowEnvelope>;
  repairScenario: (runId: string, provider: RepairProvider) => Promise<RepairEnvelope>;
  suggestScenarioIdea?: (previousIdeas?: string[]) => Promise<ScenarioIdeaResponse>;
};

export type ScenarioState = {
  view: View;
  activeStage: StageId;
  request: string;
  provider: Provider;
  selectedCaseId: string | null;
  promptVariantIndex: number;
  capabilities: CapabilitiesResponse | null;
  workflow: WorkflowEnvelope | null;
  runProgress: RunProgress | null;
  repairResult: RepairEnvelope | null;
  revisionRequest: string;
  revisionParameters: Record<string, unknown>;
  initialized: boolean;
  initializing: boolean;
  running: boolean;
  revising: boolean;
  repairing: boolean;
  suggesting: boolean;
  ideaUsage: ScenarioIdeaResponse["provider_usage"] | null;
  repairProvider: RepairProvider;
  error: string | null;
  outcome: IntentOutcome | null;
  setView: (view: View) => void;
  setStage: (stage: StageId) => void;
  setRequest: (request: string) => void;
  setRevisionRequest: (request: string) => void;
  setRevisionParameter: (name: string, value: unknown) => void;
  clearRevisionParameters: () => void;
  setRepairProvider: (provider: RepairProvider) => void;
  setProvider: (provider: Provider) => void;
  setControlledCase: (caseId: string) => void;
  shufflePrompt: () => void;
  suggestIdea: () => Promise<void>;
  initialize: () => Promise<void>;
  generate: () => Promise<void>;
  revise: () => Promise<void>;
  repair: () => Promise<void>;
  reset: () => void;
};

const defaultApi: ScenarioApi = {
  getCapabilities,
  generateScenario,
  reviseScenario,
  repairScenario,
  suggestScenarioIdea,
};

export function createScenarioStore(api: ScenarioApi = defaultApi) {
  return createStore<ScenarioState>((set, get) => ({
    view: "workspace",
    activeStage: "intent",
    request: "",
    provider: "controlled_case",
    selectedCaseId: null,
    promptVariantIndex: 0,
    capabilities: null,
    workflow: null,
    runProgress: null,
    repairResult: null,
    revisionRequest: "",
    revisionParameters: {},
    initialized: false,
    initializing: false,
    running: false,
    revising: false,
    repairing: false,
    suggesting: false,
    ideaUsage: null,
    repairProvider: "deterministic_demo",
    error: null,
    outcome: null,
    setView: (view) => set({ view }),
    setStage: (activeStage) => set({ activeStage }),
    setRequest: (request) => set({ request, ...clearedCandidateState() }),
    setRevisionRequest: (revisionRequest) => set({ revisionRequest }),
    setRevisionParameter: (name, value) =>
      set((state) => ({
        revisionParameters: { ...state.revisionParameters, [name]: value },
      })),
    clearRevisionParameters: () => set({ revisionParameters: {} }),
    setRepairProvider: (repairProvider) => set({ repairProvider }),
    setProvider: (provider) => {
      const next: Partial<ScenarioState> = {
        provider,
        error: null,
        outcome: null,
        ideaUsage: null,
        ...clearedCandidateState(),
      };
      if (provider === "controlled_case") {
        const selected = selectedCase(get());
        if (selected)
          next.request =
            selected.prompt_variants[get().promptVariantIndex] ?? selected.prompt_variants[0] ?? "";
      }
      set(next);
    },
    setControlledCase: (caseId) => {
      const selected = get().capabilities?.controlled_cases.find((item) => item.id === caseId);
      set({
        selectedCaseId: caseId,
        promptVariantIndex: 0,
        request: selected?.prompt_variants[0] ?? "",
        error: null,
        outcome: null,
        ideaUsage: null,
        ...clearedCandidateState(),
      });
    },
    shufflePrompt: () => {
      const selected = selectedCase(get());
      if (!selected?.prompt_variants.length) return;
      const nextIndex = (get().promptVariantIndex + 1) % selected.prompt_variants.length;
      set({
        promptVariantIndex: nextIndex,
        request: selected.prompt_variants[nextIndex],
        ideaUsage: null,
        ...clearedCandidateState(),
      });
    },
    suggestIdea: async () => {
      const state = get();
      if (
        state.suggesting ||
        state.running ||
        state.provider !== "llm" ||
        !state.capabilities?.providers.llm.configured
      )
        return;
      const suggest = api.suggestScenarioIdea;
      if (!suggest) {
        set({ error: "Scenario idea generation is unavailable." });
        return;
      }
      set({ suggesting: true, error: null, outcome: null });
      try {
        const idea = await suggest(state.request.trim() ? [state.request.trim()] : []);
        set({
          suggesting: false,
          request: idea.scenario_text,
          ideaUsage: idea.provider_usage,
          ...clearedCandidateState(),
        });
      } catch (error) {
        set({ suggesting: false, error: errorMessage(error) });
      }
    },
    initialize: async () => {
      if (get().initialized || get().initializing) return;
      set({ initializing: true, error: null });
      try {
        const capabilities = await api.getCapabilities();
        const firstCase = capabilities.controlled_cases[0] ?? null;
        set({
          capabilities,
          selectedCaseId: firstCase?.id ?? null,
          request: firstCase?.prompt_variants[0] ?? "",
          initialized: true,
          initializing: false,
          repairProvider: capabilities.providers.llm.configured
            ? "llm"
            : "deterministic_demo",
        });
      } catch (error) {
        set({ initializing: false, initialized: true, error: errorMessage(error) });
      }
    },
    generate: async () => {
      const state = get();
      if (state.running || !state.request.trim()) return;
      set({
        running: true,
        error: null,
        outcome: null,
        ideaUsage: null,
        activeStage: "intent",
        runProgress: null,
      });
      try {
        const workflow = await api.generateScenario(
          {
            scenario_text: state.request.trim(),
            provider: state.provider,
            controlled_case_id:
              state.provider === "controlled_case"
                ? (state.selectedCaseId ?? undefined)
                : undefined,
          },
          (runProgress) => {
            set({
              runProgress,
              activeStage: progressStage(runProgress.active_stage, get().activeStage),
            });
          },
        );
        set({ workflow, running: false, activeStage: "intent" });
      } catch (error) {
        set({
          running: false,
          error: errorMessage(error),
          outcome: error instanceof ScenarioCraftApiError ? (error.body.outcome ?? null) : null,
        });
      }
    },
    revise: async () => {
      const state = get();
      const hasParameters = Object.keys(state.revisionParameters).length > 0;
      if (state.revising || !state.workflow || (!state.revisionRequest.trim() && !hasParameters))
        return;
      const useLlm = Boolean(state.revisionRequest.trim());
      set({ revising: true, error: null, outcome: null, runProgress: null });
      try {
        const workflow = await api.reviseScenario(
          {
            scenario_text: state.request.trim(),
            provider: useLlm ? "llm" : "controlled_case",
            controlled_case_id: !useLlm ? (state.selectedCaseId ?? undefined) : undefined,
            revision_request: state.revisionRequest.trim() || undefined,
            base_scenario_type: state.workflow.result.spec.scenario_type,
            base_run_id: state.workflow.run_id,
            template_parameters: state.revisionParameters,
          },
          (runProgress) => {
            set({
              runProgress,
              activeStage: progressStage(runProgress.active_stage, get().activeStage),
            });
          },
        );
        set({
          workflow,
          revising: false,
          revisionRequest: "",
          revisionParameters: {},
          repairResult: null,
        });
      } catch (error) {
        set({
          revising: false,
          error: errorMessage(error),
          outcome: error instanceof ScenarioCraftApiError ? (error.body.outcome ?? null) : null,
        });
      }
    },
    repair: async () => {
      const state = get();
      if (state.repairing || !state.workflow) return;
      set({ repairing: true, error: null });
      try {
        const repairResult = await api.repairScenario(state.workflow.run_id, state.repairProvider);
        set({ repairResult, repairing: false, activeStage: "repair" });
      } catch (error) {
        set({ repairing: false, error: errorMessage(error) });
      }
    },
    reset: () =>
      set({
        workflow: null,
        repairResult: null,
        revisionRequest: "",
        revisionParameters: {},
        error: null,
        outcome: null,
        activeStage: "intent",
        runProgress: null,
      }),
  }));
}

function selectedCase(state: Pick<ScenarioState, "capabilities" | "selectedCaseId">) {
  return state.capabilities?.controlled_cases.find((item) => item.id === state.selectedCaseId);
}

function clearedCandidateState() {
  return {
    workflow: null,
    runProgress: null,
    repairResult: null,
    revisionRequest: "",
    revisionParameters: {},
    activeStage: "intent" as const,
  };
}

function progressStage(stage: string | null, fallback: StageId): StageId {
  if (
    stage === "intent" ||
    stage === "spec" ||
    stage === "build" ||
    stage === "checks" ||
    stage === "quality" ||
    stage === "simulation"
  )
    return stage;
  return fallback;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "ScenarioCraft request failed.";
}

const scenarioStore = createScenarioStore();

export function useScenarioStore<T>(selector: (state: ScenarioState) => T): T {
  return useStore(scenarioStore, selector);
}
