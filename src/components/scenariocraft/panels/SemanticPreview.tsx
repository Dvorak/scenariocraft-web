import { Eye } from "lucide-react";
import { API_ORIGIN } from "@/lib/scenariocraft/api";
import { resolveArtifactUrl } from "@/lib/scenariocraft/resultView";
import { useScenarioStore } from "@/lib/scenariocraft/store";
import { Card } from "../primitives";

export function SemanticPreview() {
  return (
    <Card title="Preview 2D Semantic" icon={<Eye className="h-4 w-4" />} padded={false}>
      <SemanticPreviewContent />
    </Card>
  );
}

export function SemanticPreviewContent({ compact = false }: { compact?: boolean }) {
  const workflow = useScenarioStore((state) => state.workflow);
  const runProgress = useScenarioStore((state) => state.runProgress);
  const running = useScenarioStore((state) => state.running);
  const url = resolveArtifactUrl(
    runProgress?.artifact_urls.preview ?? workflow?.artifact_urls.preview,
    API_ORIGIN,
  );

  return (
    <div
      className={`flex h-full items-center justify-center ${
        compact ? "min-h-0 overflow-hidden p-3" : "min-h-[340px] p-5"
      }`}
    >
      {url ? (
        <img
          src={url}
          alt="ScenarioCraft semantic preview"
          className={
            compact
              ? "h-full min-h-0 w-full max-w-full object-contain"
              : "max-h-[520px] w-full object-contain"
          }
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
  );
}

export function EmptyMedia({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-48 w-full items-center justify-center rounded-xl border border-dashed border-border bg-surface-muted px-6 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}
