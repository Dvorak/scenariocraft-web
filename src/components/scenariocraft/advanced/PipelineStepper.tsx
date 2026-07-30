import { motion } from "framer-motion";
import {
  MessageSquare,
  FileText,
  Box,
  ShieldCheck,
  BarChart3,
  Award,
  Play,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { emptyStages, projectWorkflowResult, STAGES } from "@/lib/scenariocraft/resultView";
import { useScenarioStore } from "@/lib/scenariocraft/store";
import type { StageId } from "@/lib/scenariocraft/types";
import { StatusDot } from "../primitives";

const icons: Record<StageId, LucideIcon> = {
  intent: MessageSquare,
  spec: FileText,
  build: Box,
  checks: ShieldCheck,
  metrics: BarChart3,
  quality: Award,
  simulation: Play,
  repair: Wrench,
};

export function PipelineStepper() {
  const workflow = useScenarioStore((s) => s.workflow);
  const running = useScenarioStore((s) => s.running);
  const runProgress = useScenarioStore((s) => s.runProgress);
  const active = useScenarioStore((s) => s.activeStage);
  const setStage = useScenarioStore((s) => s.setStage);
  const status = workflow ? projectWorkflowResult(workflow).stages : emptyStages();
  if (runProgress) {
    for (const [stage, detail] of Object.entries(runProgress.stages)) {
      if (stage in status) status[stage as StageId] = detail.status;
    }
  } else if (running && !workflow) {
    status.intent = "running";
  }

  return (
    <div
      role="tablist"
      aria-label="Pipeline stages"
      className="relative flex items-start gap-0 overflow-x-auto rounded-2xl border border-border bg-card p-5 shadow-card"
      onKeyDown={(e) => {
        const idx = STAGES.findIndex((s) => s.id === active);
        if (e.key === "ArrowRight" && idx < STAGES.length - 1) setStage(STAGES[idx + 1].id);
        if (e.key === "ArrowLeft" && idx > 0) setStage(STAGES[idx - 1].id);
      }}
    >
      {STAGES.map((stage, i) => {
        const Icon = icons[stage.id];
        const st = status[stage.id];
        const isActive = active === stage.id;
        const isDone = st === "passed" || st === "warning" || st === "skipped";
        return (
          <div key={stage.id} className="flex min-w-0 flex-1 items-start">
            <button
              role="tab"
              aria-selected={isActive}
              onClick={() => setStage(stage.id)}
              className="group relative flex min-w-0 flex-col items-center gap-2 px-1 focus:outline-none"
            >
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className={`relative grid h-11 w-11 place-items-center rounded-full border transition-all ${
                  isActive
                    ? "border-coral bg-coral-soft text-coral"
                    : isDone
                      ? "border-border bg-surface text-foreground"
                      : "border-border bg-surface-muted text-muted-foreground"
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={isActive ? 2.2 : 1.8} />
                {isActive && (
                  <motion.span
                    layoutId="stepper-ring"
                    className="pointer-events-none absolute inset-[-4px] rounded-full ring-2 ring-coral/25"
                    transition={{ type: "spring", stiffness: 400, damping: 34 }}
                  />
                )}
              </motion.div>
              <div
                className={`text-[12px] font-medium transition-colors ${
                  isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                }`}
              >
                {stage.label}
              </div>
              <StatusDot status={st as never} />
            </button>
            {i < STAGES.length - 1 && (
              <div className="relative mt-[22px] h-px flex-1">
                <div className="absolute inset-0 bg-border" />
                <motion.div
                  className="absolute inset-y-0 left-0 bg-coral"
                  initial={false}
                  animate={{ width: isDone ? "100%" : "0%" }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
