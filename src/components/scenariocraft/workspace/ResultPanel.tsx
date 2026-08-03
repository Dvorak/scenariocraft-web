import { Eye } from "lucide-react";
import { useScenarioStore } from "@/lib/scenariocraft/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "../primitives";
import { EsminiPlaybackContent } from "../panels/EsminiPlayback";
import { SemanticPreviewContent } from "../panels/SemanticPreview";

export function ResultPanel() {
  const workflow = useScenarioStore((state) => state.workflow);
  const running = useScenarioStore((state) => state.running || state.revising);
  const playback = workflow?.result.playback_result;
  const kind = typeof playback?.playback_kind === "string" ? playback.playback_kind : "unavailable";
  const previewFallback = kind.startsWith("preview_");

  return (
    <Tabs defaultValue="semantic" className="h-full min-h-0 overflow-hidden">
      <Card
        title="Result"
        icon={<Eye className="h-4 w-4" />}
        action={
          <TabsList className="h-8 border border-border bg-surface-muted p-0.5">
            <TabsTrigger value="semantic" className="h-7 px-3 text-[10px]">
              2D Semantic
            </TabsTrigger>
            <TabsTrigger value="esmini" className="h-7 px-3 text-[10px]">
              Esmini
            </TabsTrigger>
          </TabsList>
        }
        padded={false}
        bodyClassName="min-h-0 overflow-hidden"
        className="grid h-full min-h-[400px] grid-rows-[auto_minmax(0,1fr)] overflow-hidden"
      >
        <TabsContent value="semantic" className="mt-0 h-full min-h-0 overflow-hidden">
          <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)_auto] overflow-hidden">
            <SemanticPreviewContent compact />
            <MediaCaption
              title="2D Semantic Preview"
              detail="deterministic ScenarioSpec rendering"
              state={
                running ? "updating candidate" : workflow ? "accepted candidate" : "not generated"
              }
            />
          </div>
        </TabsContent>

        <TabsContent value="esmini" className="mt-0 h-full min-h-0 overflow-hidden">
          <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)_auto] overflow-hidden">
            <EsminiPlaybackContent compact />
            <MediaCaption
              title={
                previewFallback
                  ? "2D Preview Fallback"
                  : kind === "esmini_single_frame"
                    ? "Esmini Screenshot"
                    : "Esmini Runtime"
              }
              detail={
                previewFallback
                  ? "preview-derived · not runtime media"
                  : "verified raw simulator media"
              }
              state={running ? "collecting evidence" : humanizeKind(kind)}
            />
          </div>
        </TabsContent>
      </Card>
    </Tabs>
  );
}

function MediaCaption({ title, detail, state }: { title: string; detail: string; state: string }) {
  return (
    <div className="flex min-h-10 items-center justify-between gap-3 border-t border-border/70 px-4 text-[10px] text-muted-foreground">
      <span className="min-w-0 truncate">
        <strong className="font-semibold text-foreground">{title}</strong> · {detail}
      </span>
      <span className="shrink-0">{state}</span>
    </div>
  );
}

function humanizeKind(kind: string): string {
  return kind === "unavailable" ? "unavailable" : kind.replaceAll("_", " ");
}
