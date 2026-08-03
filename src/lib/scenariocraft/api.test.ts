import { afterEach, describe, expect, it, vi } from "vitest";
import { ScenarioCraftApiError, suggestScenarioIdea } from "./api";

describe("ScenarioCraft API client", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("turns a stale API 404 text response into an actionable error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("Not Found", {
          status: 404,
          statusText: "Not Found",
          headers: { "content-type": "text/plain" },
        }),
      ),
    );

    await expect(suggestScenarioIdea()).rejects.toMatchObject({
      name: "ScenarioCraftApiError",
      status: 404,
      body: {
        error: "invalid_api_response",
        message: expect.stringContaining("restart `.venv/bin/just web`"),
      },
    } satisfies Partial<ScenarioCraftApiError>);
  });
});
