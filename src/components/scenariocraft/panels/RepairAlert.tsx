import { AlertTriangle } from "lucide-react";
import { candidateFailures } from "@/lib/scenariocraft/resultView";
import { useScenarioStore } from "@/lib/scenariocraft/store";

export function RepairAlert({ embedded = false }: { embedded?: boolean } = {}) {
  const workflow = useScenarioStore((state) => state.workflow);
  const repair = useScenarioStore((state) => state.repair);
  const repairing = useScenarioStore((state) => state.repairing);
  const repairProvider = useScenarioStore((state) => state.repairProvider);
  const setRepairProvider = useScenarioStore((state) => state.setRepairProvider);
  const repairResult = useScenarioStore((state) => state.repairResult);
  const localLlmReady = useScenarioStore(
    (state) => state.capabilities?.providers.local_llm.configured === true,
  );
  if (!workflow) return null;
  const failures = candidateFailures(workflow);
  const repairRequired = workflow.result.prepared_case?.repair_required === true;
  const candidateRejected = workflow.result.candidate_trace?.acceptance_status === "rejected";
  if (!repairRequired && !candidateRejected) return null;

  return (
    <section
      className={`border border-coral/25 bg-coral-soft ${
        embedded ? "ml-10 rounded-[4px_12px_12px_12px] p-3.5" : "rounded-2xl p-5 shadow-card"
      }`}
    >
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
        <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
          <label className="sr-only" htmlFor="repair-provider">
            Repair provider
          </label>
          <select
            id="repair-provider"
            value={repairProvider}
            onChange={(event) =>
              setRepairProvider(event.target.value as "local_llm" | "deterministic_demo")
            }
            className="h-10 min-w-0 rounded-xl border border-coral/30 bg-surface px-3 text-sm font-medium"
          >
            {localLlmReady && <option value="local_llm">Local LLM · PatchSpec</option>}
            <option value="deterministic_demo">Deterministic demo</option>
          </select>
          <button
            type="button"
            onClick={() => void repair()}
            disabled={repairing}
            className="flex h-10 items-center justify-center rounded-xl border border-coral/30 bg-surface px-4 text-sm font-semibold transition-colors hover:bg-coral/5 disabled:opacity-50"
          >
            {repairing ? "Repairing…" : "Run repair"}
          </button>
        </div>
      )}
      {repairResult && (
        <p className="mt-3 text-xs text-muted-foreground">
          PatchSpec Repair · {repairTerminalStatus(repairResult.repair_result)}
        </p>
      )}
    </section>
  );
}

function repairTerminalStatus(result: Record<string, unknown>): string {
  const value = result.terminal_status;
  return typeof value === "string" ? value.replaceAll("_", " ") : "completed";
}
