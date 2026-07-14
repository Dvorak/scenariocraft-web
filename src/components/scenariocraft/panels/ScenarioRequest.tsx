import { motion } from "framer-motion";
import { Play, RotateCw, Shuffle } from "lucide-react";
import { useScenarioStore } from "@/lib/scenariocraft/store";
import { Card } from "../primitives";

export function ScenarioRequest() {
  const request = useScenarioStore((state) => state.request);
  const setRequest = useScenarioStore((state) => state.setRequest);
  const provider = useScenarioStore((state) => state.provider);
  const setProvider = useScenarioStore((state) => state.setProvider);
  const selectedCaseId = useScenarioStore((state) => state.selectedCaseId);
  const setControlledCase = useScenarioStore((state) => state.setControlledCase);
  const capabilities = useScenarioStore((state) => state.capabilities);
  const initializeError = useScenarioStore((state) => state.error);
  const outcome = useScenarioStore((state) => state.outcome);
  const initializing = useScenarioStore((state) => state.initializing);
  const generate = useScenarioStore((state) => state.generate);
  const shufflePrompt = useScenarioStore((state) => state.shufflePrompt);
  const running = useScenarioStore((state) => state.running);
  const reset = useScenarioStore((state) => state.reset);
  const local = capabilities?.providers.local_llm;

  return (
    <Card title="Scenario Request">
      <textarea
        value={request}
        onChange={(event) => setRequest(event.target.value)}
        rows={5}
        disabled={initializing}
        className="w-full resize-none rounded-xl border border-border bg-surface-muted px-3.5 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-coral/40 focus:outline-none focus:ring-2 focus:ring-coral/20 disabled:opacity-60"
        placeholder={initializing ? "Connecting to ScenarioCraft…" : "Describe a driving scenario…"}
      />

      <div className="mt-3 grid grid-cols-[minmax(112px,0.72fr)_minmax(0,1.5fr)_40px_40px] items-stretch gap-2">
        <Select
          value={provider}
          onChange={(value) => setProvider(value as typeof provider)}
          label="Provider"
        >
          <option value="controlled_case">Demo</option>
          <option value="local_llm">LLM</option>
        </Select>

        {provider === "controlled_case" ? (
          <Select value={selectedCaseId ?? ""} onChange={setControlledCase} label="Controlled case">
            {capabilities?.controlled_cases.map((item) => (
              <option key={item.id} value={item.id}>
                {item.display_name}
              </option>
            ))}
          </Select>
        ) : (
          <div className="flex min-w-0 items-center rounded-xl border border-border bg-surface px-3.5 text-sm text-muted-foreground">
            <span className="truncate">
              {local?.configured
                ? `ollama · ${local.selected_model ?? "model ready"}`
                : (local?.message ?? "Local LLM not configured")}
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={provider === "controlled_case" ? shufflePrompt : reset}
          className="grid h-10 w-10 place-items-center self-center rounded-xl border border-border bg-surface text-muted-foreground transition-colors hover:text-foreground"
          title={provider === "controlled_case" ? "Try another prompt" : "Clear result"}
          aria-label={provider === "controlled_case" ? "Try another prompt" : "Clear result"}
        >
          {provider === "controlled_case" ? (
            <Shuffle className="h-4 w-4" />
          ) : (
            <RotateCw className="h-4 w-4" />
          )}
        </button>

        <motion.button
          type="button"
          onClick={() => void generate()}
          disabled={running || !request.trim() || (provider === "local_llm" && !local?.configured)}
          whileTap={{ scale: 0.96 }}
          className="grid h-10 w-10 place-items-center self-center rounded-xl bg-coral text-coral-foreground shadow-[0_6px_18px_-6px_oklch(0.68_0.19_25/0.6)] transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-45"
          title="Generate"
          aria-label="Generate scenario"
        >
          <Play className="h-4 w-4 fill-current" />
        </motion.button>
      </div>

      <div className="mt-3 min-h-5 text-xs text-muted-foreground" role="status">
        {running
          ? "Candidate Generation · resolving, checking, and building…"
          : initializeError
            ? initializeError
            : provider === "local_llm" && local?.configured
              ? `LLM ready · ${local.selected_model ?? "local model"}`
              : "Ready"}
      </div>

      {outcome && (
        <div className="mt-2 rounded-xl border border-warning/30 bg-warning/10 px-3.5 py-3 text-xs leading-relaxed">
          <div className="font-semibold">{outcome.status ?? "Intent needs attention"}</div>
          <div className="mt-1 text-muted-foreground">
            {outcome.clarification_question ?? outcome.rationale ?? outcome.refusal_reason}
          </div>
          {!!outcome.nearest_template_candidates?.length && (
            <div className="mt-1.5 text-muted-foreground">
              Nearest families: {outcome.nearest_template_candidates.join(", ")}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function Select({
  value,
  onChange,
  label,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      aria-label={label}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 min-w-0 rounded-xl border border-border bg-surface px-3 text-sm font-medium text-foreground focus:border-coral/40 focus:outline-none focus:ring-2 focus:ring-coral/20"
    >
      {children}
    </select>
  );
}
