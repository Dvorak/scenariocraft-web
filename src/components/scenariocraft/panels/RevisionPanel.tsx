import { GitBranch, Play } from "lucide-react";
import { useScenarioStore } from "@/lib/scenariocraft/store";

export function RevisionPanel() {
  const workflow = useScenarioStore((state) => state.workflow);
  const revisionRequest = useScenarioStore((state) => state.revisionRequest);
  const setRevisionRequest = useScenarioStore((state) => state.setRevisionRequest);
  const revise = useScenarioStore((state) => state.revise);
  const revising = useScenarioStore((state) => state.revising);
  if (!workflow) return null;

  return (
    <details className="rounded-2xl border border-border bg-card shadow-card">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-5 py-3.5 text-[13px] font-semibold">
        <GitBranch className="h-4 w-4 text-coral" />
        Scenario Revision
      </summary>
      <div className="border-t border-border/70 p-5">
        <textarea
          value={revisionRequest}
          onChange={(event) => setRevisionRequest(event.target.value)}
          rows={3}
          className="w-full resize-none rounded-xl border border-border bg-surface-muted px-3.5 py-3 text-sm leading-relaxed focus:border-coral/40 focus:outline-none focus:ring-2 focus:ring-coral/20"
          placeholder="Describe a variant, for example: shorter gap, wet road, slower secondary actor…"
        />
        <button
          type="button"
          onClick={() => void revise()}
          disabled={revising || !revisionRequest.trim()}
          className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface text-sm font-semibold transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Play className="h-3.5 w-3.5" />
          {revising ? "Creating candidate…" : "Create variant"}
        </button>
      </div>
    </details>
  );
}
