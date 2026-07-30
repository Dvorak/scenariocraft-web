import { describe, expect, it } from "vitest";
import { ScenarioCraftApiError } from "./api";
import { createScenarioStore, type ScenarioApi } from "./store";
import type { CapabilitiesResponse, RunProgress, WorkflowEnvelope } from "./types";

const capabilities: CapabilitiesResponse = {
  providers: {
    controlled_case: { configured: true },
    local_llm: {
      configured: true,
      reachable: true,
      server_url: "http://localhost:11434/v1",
      models: ["qwen2.5:7b"],
      selected_model: "qwen2.5:7b",
      message: "Ready",
    },
  },
  controlled_cases: [
    {
      id: "cut_in",
      template_id: "cut_in",
      display_name: "Cut-in",
      description: "Adjacent vehicle cuts in.",
      prompt_variants: ["A vehicle cuts in.", "Create a cut-in conflict."],
    },
    {
      id: "lead_vehicle_braking",
      template_id: "lead_vehicle_braking",
      display_name: "Lead vehicle braking",
      description: "Lead vehicle brakes.",
      prompt_variants: ["A lead vehicle brakes."],
    },
  ],
};

const envelope = {
  run_id: "run-1",
  artifact_urls: {},
  result: {
    request: { scenario_text: "A vehicle cuts in.", provider_name: "controlled_case" },
    status: { terminal_status: "passed", terminal_reason: "Passed", warnings: [] },
    artifacts: {},
    spec: { scenario_type: "cut_in", actors: [], intended_criticality: {} },
  },
} satisfies WorkflowEnvelope;

describe("scenario store", () => {
  it("loads capabilities and initializes a stable controlled case prompt", async () => {
    const api: ScenarioApi = {
      getCapabilities: async () => capabilities,
      generateScenario: async () => envelope,
      reviseScenario: async () => envelope,
      repairScenario: async () => ({
        run_id: "repair-1",
        source_run_id: "run-1",
        repair_result: {},
        artifact_urls: {},
      }),
    };
    const store = createScenarioStore(api);

    await store.getState().initialize();

    expect(store.getState().selectedCaseId).toBe("cut_in");
    expect(store.getState().request).toBe("A vehicle cuts in.");
    expect(store.getState().provider).toBe("controlled_case");
  });

  it("generates through the API and stores the real workflow envelope", async () => {
    let submittedProvider = "";
    const api: ScenarioApi = {
      getCapabilities: async () => capabilities,
      generateScenario: async (request) => {
        submittedProvider = request.provider;
        return envelope;
      },
      reviseScenario: async () => envelope,
      repairScenario: async () => ({
        run_id: "repair-1",
        source_run_id: "run-1",
        repair_result: {},
        artifact_urls: {},
      }),
    };
    const store = createScenarioStore(api);
    await store.getState().initialize();

    await store.getState().generate();

    expect(submittedProvider).toBe("controlled_case");
    expect(store.getState().workflow?.run_id).toBe("run-1");
    expect(store.getState().running).toBe(false);
    expect(store.getState().error).toBeNull();
  });

  it("projects live workflow progress before the final envelope arrives", async () => {
    const progress = {
      run_id: "run-1",
      status: "running",
      active_stage: "build",
      detail: "Building OpenSCENARIO and OpenDRIVE",
      elapsed_ms: 1200,
      stages: {
        intent: { status: "passed", detail: "Intent resolved", duration_ms: 800 },
        build: { status: "running", detail: "Building artifacts", duration_ms: null },
      },
      provider_usage: {
        provider_name: "openai_compatible",
        model: "qwen2.5:7b",
        duration_ms: 800,
        input_tokens: 320,
        output_tokens: 40,
        total_tokens: 360,
        local: true,
      },
      artifact_urls: { preview: "/api/runs/run-1/artifacts/preview" },
      result: null,
      error: null,
    } satisfies RunProgress;
    const api: ScenarioApi = {
      getCapabilities: async () => capabilities,
      generateScenario: async (_request, onProgress) => {
        onProgress?.(progress);
        return envelope;
      },
      reviseScenario: async () => envelope,
      repairScenario: async () => ({
        run_id: "repair-1",
        source_run_id: "run-1",
        repair_result: {},
        artifact_urls: {},
      }),
    };
    const store = createScenarioStore(api);
    await store.getState().initialize();

    await store.getState().generate();

    expect(store.getState().runProgress?.active_stage).toBe("build");
    expect(store.getState().runProgress?.provider_usage?.total_tokens).toBe(360);
    expect(store.getState().workflow?.run_id).toBe("run-1");
  });

  it("sends revisions through the dedicated endpoint and replaces the active workflow", async () => {
    let revisionRequest = "";
    const revised = structuredClone(envelope);
    revised.run_id = "run-2";
    const api: ScenarioApi = {
      getCapabilities: async () => capabilities,
      generateScenario: async () => envelope,
      reviseScenario: async (request) => {
        revisionRequest = request.revision_request ?? "";
        return revised;
      },
      repairScenario: async () => ({
        run_id: "repair-1",
        source_run_id: "run-1",
        repair_result: {},
        artifact_urls: {},
      }),
    };
    const store = createScenarioStore(api);
    await store.getState().initialize();
    await store.getState().generate();
    store.getState().setRevisionRequest("Use a shorter gap.");

    await store.getState().revise();

    expect(revisionRequest).toBe("Use a shorter gap.");
    expect(store.getState().workflow?.run_id).toBe("run-2");
    expect(store.getState().revisionRequest).toBe("");
  });

  it("clears stale workflow output when generation inputs change", async () => {
    const api: ScenarioApi = {
      getCapabilities: async () => capabilities,
      generateScenario: async () => envelope,
      reviseScenario: async () => envelope,
      repairScenario: async () => ({
        run_id: "repair-1",
        source_run_id: "run-1",
        repair_result: {},
        artifact_urls: {},
      }),
    };
    const store = createScenarioStore(api);
    await store.getState().initialize();
    await store.getState().generate();

    store.getState().setControlledCase("lead_vehicle_braking");

    expect(store.getState().request).toBe("A lead vehicle brakes.");
    expect(store.getState().workflow).toBeNull();
    expect(store.getState().repairResult).toBeNull();
  });

  it.each(["unsupported", "clarification_required", "rejected"])(
    "preserves the structured %s intent outcome from the API",
    async (status) => {
      const api: ScenarioApi = {
        getCapabilities: async () => capabilities,
        generateScenario: async () => {
          throw new ScenarioCraftApiError(422, {
            error: "intent_outcome",
            message: `Intent ${status}.`,
            outcome: {
              status,
              rationale: "The request cannot be accepted as submitted.",
              clarification_question:
                status === "clarification_required" ? "Which interaction should be tested?" : null,
              nearest_template_candidates: ["cut_in"],
            },
          });
        },
        reviseScenario: async () => envelope,
        repairScenario: async () => ({
          run_id: "repair-1",
          source_run_id: "run-1",
          repair_result: {},
          artifact_urls: {},
        }),
      };
      const store = createScenarioStore(api);
      await store.getState().initialize();
      store.getState().setProvider("local_llm");

      await store.getState().generate();

      expect(store.getState().error).toBe(`Intent ${status}.`);
      expect(store.getState().outcome?.status).toBe(status);
      expect(store.getState().workflow).toBeNull();
      expect(store.getState().running).toBe(false);
    },
  );

  it("uses the explicit local LLM provider for PatchSpec repair when available", async () => {
    const repairable: WorkflowEnvelope = structuredClone(envelope);
    repairable.result.status.terminal_status = "repair_required";
    repairable.result.prepared_case = { repair_required: true };
    let submittedProvider = "";
    const api: ScenarioApi = {
      getCapabilities: async () => capabilities,
      generateScenario: async () => repairable,
      reviseScenario: async () => repairable,
      repairScenario: async (_runId, provider) => {
        submittedProvider = provider;
        return {
          run_id: "repair-1",
          source_run_id: "run-1",
          repair_result: { terminal_status: "passed" },
          artifact_urls: {},
        };
      },
    };
    const store = createScenarioStore(api);
    await store.getState().initialize();
    await store.getState().generate();

    expect(store.getState().repairProvider).toBe("local_llm");
    await store.getState().repair();

    expect(submittedProvider).toBe("local_llm");
    expect(store.getState().repairResult?.repair_result.terminal_status).toBe("passed");
  });
});
