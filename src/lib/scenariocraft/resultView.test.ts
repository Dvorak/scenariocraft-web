import { describe, expect, it } from "vitest";
import {
  candidateChecks,
  projectWorkflowResult,
  resolveArtifactUrl,
  runtimeChecks,
} from "./resultView";
import type { WorkflowEnvelope } from "./types";

const envelope: WorkflowEnvelope = {
  run_id: "run-1",
  artifact_urls: {
    preview: "/api/runs/run-1/artifacts/preview",
    playback: "/api/runs/run-1/artifacts/playback",
  },
  result: {
    request: { scenario_text: "A lead vehicle brakes.", provider_name: "controlled_case" },
    status: { terminal_status: "passed", terminal_reason: "All checks passed.", warnings: [] },
    artifacts: {},
    candidate_trace: {
      loop_name: "Candidate Generation Loop",
      template_id: "lead_vehicle_braking",
      acceptance_status: "accepted",
      seed: 102,
      variant_index: 0,
      sampled: true,
      resolved_parameters: {},
      unsupported_fields: [],
      fallback: null,
      check_summary: { semantic: "passed", total: 3, failed: 0, failed_checks: [] },
    },
    spec: {
      scenario_name: "lead_vehicle_braking",
      scenario_type: "lead_vehicle_braking",
      road: { type: "urban_straight", lanes_per_direction: 1, speed_limit_kph: 50 },
      weather: { condition: "clear", road_surface: "dry" },
      actors: [
        { id: "ego", role: "ego", type: "car", initial_speed_kph: 48.75 },
        { id: "lead_vehicle", role: "lead_vehicle", type: "car", initial_speed_kph: 47.26 },
      ],
      intended_criticality: { type: "lead_vehicle_braking", target_min_ttc_s: 1.61 },
      metadata: {},
    },
    build_result: {
      xosc_path: "scenario.xosc",
      xodr_path: "road.xodr",
      builder: "scenariogeneration",
    },
    semantic_result: { passed: true },
    geometry_check_results: [{ name: "gap", passed: true }],
    artifact_check_results: [{ name: "poses", passed: true }],
    runtime_check_results: [],
    qc_result: { available: true, passed: true },
    esmini_result: { available: true, succeeded: true },
    playback_result: {
      playback_kind: "esmini_gif",
      playback_frame_count: 20,
      playback_is_animated: true,
    },
  },
};

describe("projectWorkflowResult", () => {
  it("projects application evidence into UI stages without a second workflow model", () => {
    const view = projectWorkflowResult(envelope);

    expect(view.stages).toMatchObject({
      intent: "passed",
      spec: "passed",
      build: "passed",
      checks: "passed",
      metrics: "passed",
      quality: "passed",
      simulation: "passed",
      repair: "idle",
    });
    expect(view.brief).toMatchObject({
      family: "Lead vehicle braking",
      egoSpeed: "48.8 km/h",
      secondaryLabel: "Lead vehicle",
      secondaryValue: "47.3 km/h",
      targetTtc: "1.6 s",
    });
  });

  it("keeps failed checks visible even when a candidate result exists", () => {
    const failed = structuredClone(envelope);
    failed.result.geometry_check_results = [{ name: "gap", passed: false }];

    expect(projectWorkflowResult(failed).stages.checks).toBe("failed");
  });

  it("keeps optional runtime unavailability out of candidate checks", () => {
    const unavailable = structuredClone(envelope);
    unavailable.result.esmini_result = { esmini_available: false, succeeded: false };
    unavailable.result.playback_result = {
      playback_kind: "preview_static_image",
      playback_is_animated: false,
    };
    unavailable.result.runtime_check_results = [
      {
        name: "runtime_esmini_execution_available",
        passed: false,
        severity: "warning",
      },
      {
        name: "runtime_visual_media_provenance_valid",
        passed: false,
        severity: "failure",
      },
    ];

    const view = projectWorkflowResult(unavailable);

    expect(view.stages.checks).toBe("passed");
    expect(view.stages.simulation).toBe("warning");
  });
});

describe("resolveArtifactUrl", () => {
  it("joins API-relative media paths to the configured API origin", () => {
    expect(resolveArtifactUrl("/api/runs/run-1/artifacts/preview", "http://localhost:8000")).toBe(
      "http://localhost:8000/api/runs/run-1/artifacts/preview",
    );
  });
});

describe("check evidence groups", () => {
  it("keeps candidate acceptance checks separate from runtime evidence", () => {
    const grouped = structuredClone(envelope);
    grouped.result.geometry_check_results = [{ name: "geometry", passed: true }];
    grouped.result.artifact_check_results = [{ name: "artifact", passed: true }];
    grouped.result.runtime_check_results = [{ name: "runtime", passed: false }];

    expect(candidateChecks(grouped).map((check) => check.name)).toEqual(["geometry", "artifact"]);
    expect(runtimeChecks(grouped).map((check) => check.name)).toEqual(["runtime"]);
  });
});
