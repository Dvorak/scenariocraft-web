export type StageId =
  "intent" | "spec" | "build" | "checks" | "metrics" | "quality" | "simulation" | "repair";

export type StageStatus = "idle" | "running" | "passed" | "warning" | "failed";

export type JsonObject = Record<string, unknown>;

export type ControlledCase = {
  id: string;
  template_id: string;
  display_name: string;
  description: string;
  prompt_variants: string[];
};

export type CapabilitiesResponse = {
  providers: {
    controlled_case: { configured: boolean };
    local_llm: {
      configured: boolean;
      reachable: boolean;
      server_url: string;
      models: string[];
      selected_model: string | null;
      message: string;
    };
  };
  controlled_cases: ControlledCase[];
};

export type CheckResult = JsonObject & {
  name?: string;
  passed?: boolean;
  message?: string;
  severity?: string;
};

export type ActorSpec = JsonObject & {
  id?: string;
  role?: string;
  type?: string;
  initial_speed_kph?: number;
  speed_mps?: number;
};

export type ScenarioSpec = JsonObject & {
  scenario_name?: string;
  scenario_type?: string;
  road?: JsonObject;
  weather?: JsonObject;
  actors?: ActorSpec[];
  intended_criticality?: JsonObject;
  metadata?: JsonObject;
};

export type CandidateTrace = {
  loop_name: string;
  template_id: string;
  acceptance_status: "accepted" | "rejected";
  seed: number | null;
  variant_index: number;
  sampled: boolean;
  resolved_parameters: Record<string, JsonObject>;
  unsupported_fields: string[];
  fallback: JsonObject | null;
  check_summary: JsonObject;
};

export type WorkflowResult = {
  request: JsonObject & { scenario_text?: string; provider_name?: string };
  status: { terminal_status: string; terminal_reason: string; warnings: string[] };
  artifacts: JsonObject;
  intent_proposal?: JsonObject | null;
  candidate_trace?: CandidateTrace | null;
  spec: ScenarioSpec;
  original_spec?: ScenarioSpec | null;
  prepared_case?: JsonObject | null;
  build_result?: JsonObject | null;
  semantic_result?: (JsonObject & { passed?: boolean }) | null;
  geometry_check_results?: CheckResult[];
  artifact_check_results?: CheckResult[];
  runtime_check_results?: CheckResult[];
  qc_result?: JsonObject | null;
  esmini_result?: JsonObject | null;
  playback_result?: JsonObject | null;
};

export type WorkflowEnvelope = {
  run_id: string;
  result: WorkflowResult;
  artifact_urls: Record<string, string>;
};

export type RepairEnvelope = {
  run_id: string;
  source_run_id: string;
  repair_result: JsonObject;
  artifact_urls: Record<string, string>;
};

export type IntentOutcome = {
  status?: string;
  rationale?: string;
  refusal_reason?: string | null;
  clarification_question?: string | null;
  nearest_template_candidates?: string[];
  refinement_suggestions?: JsonObject[];
};

export type ApiErrorBody = {
  error: string;
  message: string;
  outcome?: IntentOutcome;
};

export type GenerateRequest = {
  scenario_text: string;
  provider: "controlled_case" | "local_llm";
  controlled_case_id?: string;
  revision_request?: string;
  base_scenario_type?: string;
  options?: Record<string, unknown>;
};
