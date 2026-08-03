import { Play } from "lucide-react";
import { API_ORIGIN } from "@/lib/scenariocraft/api";
import { resolveArtifactUrl } from "@/lib/scenariocraft/resultView";
import { useScenarioStore } from "@/lib/scenariocraft/store";
import { Card } from "../primitives";
import { EmptyMedia } from "./SemanticPreview";

export function EsminiPlayback() {
  const playback = useScenarioStore((state) => state.workflow?.result.playback_result);
  const kind = typeof playback?.playback_kind === "string" ? playback.playback_kind : "unavailable";
  const isPreviewFallback = kind.startsWith("preview_");
  const title = isPreviewFallback
    ? "2D Preview Fallback"
    : kind === "esmini_single_frame"
      ? "Esmini Screenshot"
      : "Playback Esmini";

  return (
    <Card title={title} icon={<Play className="h-4 w-4" />} padded={false}>
      <EsminiPlaybackContent />
    </Card>
  );
}

export function EsminiPlaybackContent({ compact = false }: { compact?: boolean }) {
  const workflow = useScenarioStore((state) => state.workflow);
  const runProgress = useScenarioStore((state) => state.runProgress);
  const running = useScenarioStore((state) => state.running);
  const url = resolveArtifactUrl(
    runProgress?.artifact_urls.playback ?? workflow?.artifact_urls.playback,
    API_ORIGIN,
  );
  const playback = workflow?.result.playback_result;
  const kind = typeof playback?.playback_kind === "string" ? playback.playback_kind : "unavailable";
  const isPreviewFallback = kind.startsWith("preview_");

  return (
    <div
      className={`flex h-full flex-col items-center justify-center ${
        compact ? "min-h-0 overflow-hidden p-3" : "min-h-[340px] p-5"
      }`}
    >
      {url ? (
        <>
          <img
            src={url}
            alt={isPreviewFallback ? "2D preview fallback" : "Raw esmini runtime media"}
            className="min-h-0 max-h-full w-full max-w-full flex-1 object-contain"
          />
          <div className="mt-2.5 w-full text-[10px] text-muted-foreground">
            {isPreviewFallback
              ? "Preview-derived fallback · not esmini playback"
              : `Verified source · ${kind.replaceAll("_", " ")}`}
          </div>
        </>
      ) : (
        <EmptyMedia>
          {running && runProgress?.active_stage === "simulation"
            ? "Running esmini and collecting runtime evidence…"
            : "Verified esmini media is unavailable for this run."}
        </EmptyMedia>
      )}
    </div>
  );
}
