import type {
  ApiErrorBody,
  CapabilitiesResponse,
  GenerateRequest,
  RepairEnvelope,
  WorkflowEnvelope,
} from "./types";

export const API_ORIGIN =
  (import.meta.env.VITE_SCENARIOCRAFT_API_URL as string | undefined)?.replace(/\/$/, "") ??
  "http://localhost:8000";

export class ScenarioCraftApiError extends Error {
  readonly status: number;
  readonly body: ApiErrorBody;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message || body.error);
    this.name = "ScenarioCraftApiError";
    this.status = status;
    this.body = body;
  }
}

export async function getCapabilities(): Promise<CapabilitiesResponse> {
  return requestJson<CapabilitiesResponse>("/api/capabilities");
}

export async function generateScenario(payload: GenerateRequest): Promise<WorkflowEnvelope> {
  return requestJson<WorkflowEnvelope>("/api/scenarios/generate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function reviseScenario(payload: GenerateRequest): Promise<WorkflowEnvelope> {
  return requestJson<WorkflowEnvelope>("/api/scenarios/revise", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function repairScenario(runId: string): Promise<RepairEnvelope> {
  return requestJson<RepairEnvelope>("/api/scenarios/repair", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ run_id: runId, provider: "deterministic_demo" }),
  });
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_ORIGIN}${path}`, init);
  const body = (await response.json()) as T | ApiErrorBody;
  if (!response.ok) throw new ScenarioCraftApiError(response.status, body as ApiErrorBody);
  return body as T;
}
