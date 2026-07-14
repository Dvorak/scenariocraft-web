import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";
import {
  ScenarioCraftApiError,
  generateScenario,
  getCapabilities,
  repairScenario,
  reviseScenario,
} from "./api";
import type {
  CapabilitiesResponse,
  GenerateRequest,
  IntentOutcome,
  RepairEnvelope,
  StageId,
  WorkflowEnvelope,
} from "./types";

type View = "workspace" | "advanced";
type Provider = GenerateRequest["provider"];

export type ScenarioApi = {
  getCapabilities: () => Promise<CapabilitiesResponse>;
  generateScenario: (request: GenerateRequest) => Promise<WorkflowEnvelope>;
  reviseScenario: (request: GenerateRequest) => Promise<WorkflowEnvelope>;
  repairScenario: (runId: string) => Promise<RepairEnvelope>;
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
  repairResult: RepairEnvelope | null;
  revisionRequest: string;
  initialized: boolean;
  initializing: boolean;
  running: boolean;
  revising: boolean;
  repairing: boolean;
  error: string | null;
  outcome: IntentOutcome | null;
  setView: (view: View) => void;
  setStage: (stage: StageId) => void;
  setRequest: (request: string) => void;
  setRevisionRequest: (request: string) => void;
  setProvider: (provider: Provider) => void;
  setControlledCase: (caseId: string) => void;
  shufflePrompt: () => void;
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
    repairResult: null,
    revisionRequest: "",
    initialized: false,
    initializing: false,
    running: false,
    revising: false,
    repairing: false,
    error: null,
    outcome: null,
    setView: (view) => set({ view }),
    setStage: (activeStage) => set({ activeStage }),
    setRequest: (request) => set({ request, ...clearedCandidateState() }),
    setRevisionRequest: (revisionRequest) => set({ revisionRequest }),
    setProvider: (provider) => {
      const next: Partial<ScenarioState> = {
        provider,
        error: null,
        outcome: null,
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
        ...clearedCandidateState(),
      });
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
        });
      } catch (error) {
        set({ initializing: false, initialized: true, error: errorMessage(error) });
      }
    },
    generate: async () => {
      const state = get();
      if (state.running || !state.request.trim()) return;
      set({ running: true, error: null, outcome: null, activeStage: "intent" });
      try {
        const workflow = await api.generateScenario({
          scenario_text: state.request.trim(),
          provider: state.provider,
          controlled_case_id:
            state.provider === "controlled_case" ? (state.selectedCaseId ?? undefined) : undefined,
        });
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
      if (state.revising || !state.workflow || !state.revisionRequest.trim()) return;
      set({ revising: true, error: null, outcome: null });
      try {
        const workflow = await api.reviseScenario({
          scenario_text: state.request.trim(),
          provider: state.provider,
          controlled_case_id:
            state.provider === "controlled_case" ? (state.selectedCaseId ?? undefined) : undefined,
          revision_request: state.revisionRequest.trim(),
          base_scenario_type: state.workflow.result.spec.scenario_type,
        });
        set({ workflow, revising: false, revisionRequest: "", repairResult: null });
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
        const repairResult = await api.repairScenario(state.workflow.run_id);
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
        error: null,
        outcome: null,
        activeStage: "intent",
      }),
  }));
}

function selectedCase(state: Pick<ScenarioState, "capabilities" | "selectedCaseId">) {
  return state.capabilities?.controlled_cases.find((item) => item.id === state.selectedCaseId);
}

function clearedCandidateState() {
  return {
    workflow: null,
    repairResult: null,
    revisionRequest: "",
    activeStage: "intent" as const,
  };
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "ScenarioCraft request failed.";
}

const scenarioStore = createScenarioStore();

export function useScenarioStore<T>(selector: (state: ScenarioState) => T): T {
  return useStore(scenarioStore, selector);
}
