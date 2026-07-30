import { Eye } from "lucide-react";
import { API_ORIGIN } from "@/lib/scenariocraft/api";
import { resolveArtifactUrl } from "@/lib/scenariocraft/resultView";
import { useScenarioStore } from "@/lib/scenariocraft/store";
import { Card } from "../primitives";

export function SemanticPreview() {
  const workflow = useScenarioStore((state) => state.workflow);
  const runProgress = useScenarioStore((state) => state.runProgress);
  const running = useScenarioStore((state) => state.running);
  const url = resolveArtifactUrl(
    runProgress?.artifact_urls.preview ?? workflow?.artifact_urls.preview,
    API_ORIGIN,
  );

  return (
    <Card title="Preview 2D Semantic" icon={<Eye className="h-4 w-4" />} padded={false}>
      <div className="flex min-h-[340px] items-center justify-center p-5">
        {url ? (
          <img
            src={url}
            alt="ScenarioCraft semantic preview"
            className="max-h-[520px] w-full object-contain"
          />
        ) : (
          <EmptyMedia>
            {running
              ? runProgress?.active_stage === "intent"
                ? "Waiting for ScenarioIntent…"
                : "Building semantic preview…"
              : "Generate a scenario to preview it."}
          </EmptyMedia>
        )}
      </div>
    </Card>
  );
}

export function EmptyMedia({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-48 w-full items-center justify-center rounded-xl border border-dashed border-border bg-surface-muted px-6 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}
