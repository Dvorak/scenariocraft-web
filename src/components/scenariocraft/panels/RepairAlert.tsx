import { AlertTriangle } from "lucide-react";
import { candidateFailures } from "@/lib/scenariocraft/resultView";
import { useScenarioStore } from "@/lib/scenariocraft/store";

export function RepairAlert() {
  const workflow = useScenarioStore((state) => state.workflow);
  const repair = useScenarioStore((state) => state.repair);
  const repairing = useScenarioStore((state) => state.repairing);
  if (!workflow) return null;
  const failures = candidateFailures(workflow);
  const repairRequired = workflow.result.prepared_case?.repair_required === true;
  const candidateRejected = workflow.result.candidate_trace?.acceptance_status === "rejected";
  if (!repairRequired && !candidateRejected) return null;

  return (
    <section className="rounded-2xl border border-coral/25 bg-coral-soft p-5 shadow-card">
      <header className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
        <AlertTriangle className="h-4 w-4 text-coral" />
        {repairRequired ? "Repair Available" : "Candidate Rejected"}
      </header>
      <ul className="mt-3 space-y-2.5">
        {failures.slice(0, 3).map((failure, index) => (
          <li key={failure.name ?? index} className="flex gap-2.5 text-xs leading-relaxed">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-coral" />
            <div className="min-w-0">
              <div className="font-mono font-medium">{failure.name ?? "check_failed"}</div>
              {failure.message && (
                <div className="mt-0.5 text-muted-foreground">{failure.message}</div>
              )}
            </div>
          </li>
        ))}
      </ul>
      {repairRequired && (
        <button
          type="button"
          onClick={() => void repair()}
          disabled={repairing}
          className="mt-4 flex h-10 w-full items-center justify-center rounded-xl border border-coral/30 bg-surface text-sm font-semibold transition-colors hover:bg-coral/5 disabled:opacity-50"
        >
          {repairing ? "Running deterministic repair…" : "Run available repair"}
        </button>
      )}
    </section>
  );
}
