import { Play } from "lucide-react";
import { API_ORIGIN } from "@/lib/scenariocraft/api";
import { resolveArtifactUrl } from "@/lib/scenariocraft/resultView";
import { useScenarioStore } from "@/lib/scenariocraft/store";
import { Card } from "../primitives";
import { EmptyMedia } from "./SemanticPreview";

export function EsminiPlayback() {
  const workflow = useScenarioStore((state) => state.workflow);
  const url = resolveArtifactUrl(workflow?.artifact_urls.playback, API_ORIGIN);
  const playback = workflow?.result.playback_result;
  const kind = typeof playback?.playback_kind === "string" ? playback.playback_kind : "unavailable";
  const isPreviewFallback = kind.startsWith("preview_");
  const title = isPreviewFallback
    ? "2D Preview Fallback"
    : kind === "esmini_single_frame"
      ? "Esmini Screenshot"
      : "Playback Esmini";

  return (
    <Card title={title} icon={<Play className="h-4 w-4" />} padded={false}>
      <div className="flex min-h-[340px] flex-col items-center justify-center p-5">
        {url ? (
          <>
            <img
              src={url}
              alt={isPreviewFallback ? "2D preview fallback" : "Raw esmini runtime media"}
              className="max-h-[520px] w-full object-contain"
            />
            <div className="mt-3 w-full text-xs text-muted-foreground">
              {isPreviewFallback
                ? "Preview-derived fallback · not esmini playback"
                : `Verified source · ${kind.replaceAll("_", " ")}`}
            </div>
          </>
        ) : (
          <EmptyMedia>Verified esmini media is unavailable for this run.</EmptyMedia>
        )}
      </div>
    </Card>
  );
}
