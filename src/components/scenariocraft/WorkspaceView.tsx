import { AnimatePresence, motion } from "framer-motion";
import { ResultPanel } from "./workspace/ResultPanel";
import { ScenarioPanel } from "./workspace/ScenarioPanel";
import { ScenarioThread } from "./workspace/ScenarioThread";

export function WorkspaceView() {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="workspace"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        className="grid gap-4 xl:h-[calc(100dvh-9.5rem)] xl:min-h-[660px] xl:max-h-[900px] xl:grid-cols-[minmax(460px,0.94fr)_minmax(580px,1.06fr)]"
      >
        <ScenarioThread />
        <div className="grid min-h-[700px] grid-rows-[minmax(380px,1.15fr)_minmax(280px,0.85fr)] gap-4 xl:h-full xl:min-h-0">
          <ResultPanel />
          <ScenarioPanel />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
