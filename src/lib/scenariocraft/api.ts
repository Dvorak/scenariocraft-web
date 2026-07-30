import type {
  ApiErrorBody,
  CapabilitiesResponse,
  GenerateRequest,
  RepairEnvelope,
  RepairProvider,
  RunProgress,
  RunStart,
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

export async function generateScenario(
  payload: GenerateRequest,
  onProgress?: (progress: RunProgress) => void,
): Promise<WorkflowEnvelope> {
  return runScenario("/api/scenarios/generate", payload, onProgress);
}

export async function reviseScenario(
  payload: GenerateRequest,
  onProgress?: (progress: RunProgress) => void,
): Promise<WorkflowEnvelope> {
  return runScenario("/api/scenarios/revise", payload, onProgress);
}

async function runScenario(
  path: string,
  payload: GenerateRequest,
  onProgress?: (progress: RunProgress) => void,
): Promise<WorkflowEnvelope> {
  const started = await requestJson<RunStart>(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...payload, async_run: true }),
  });
  while (true) {
    const progress = await requestJson<RunProgress>(started.status_url);
    onProgress?.(progress);
    if (progress.status === "completed" && progress.result) {
      return {
        run_id: progress.run_id,
        result: progress.result,
        artifact_urls: progress.artifact_urls,
      };
    }
    if (progress.status === "failed") {
      throw new ScenarioCraftApiError(
        422,
        progress.error ?? {
          error: "workflow_failed",
          message: progress.detail,
        },
      );
    }
    await wait(500);
  }
}

export async function repairScenario(
  runId: string,
  provider: RepairProvider,
): Promise<RepairEnvelope> {
  return requestJson<RepairEnvelope>("/api/scenarios/repair", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ run_id: runId, provider }),
  });
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_ORIGIN}${path}`, init);
  const body = (await response.json()) as T | ApiErrorBody;
  if (!response.ok) throw new ScenarioCraftApiError(response.status, body as ApiErrorBody);
  return body as T;
}

function wait(durationMs: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, durationMs));
}
