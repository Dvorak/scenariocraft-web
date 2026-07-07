import { AnimatePresence, motion } from "framer-motion";
import { ScenarioRequest } from "./panels/ScenarioRequest";
import { StatusCard } from "./panels/StatusCard";
import { RepairAlert } from "./panels/RepairAlert";
import { ScenarioBrief } from "./panels/ScenarioBrief";
import { SemanticPreview } from "./panels/SemanticPreview";
import { EsminiPlayback } from "./panels/EsminiPlayback";

export function WorkspaceView() {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="workspace"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        className="grid gap-5 lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)]"
      >
        <div className="flex flex-col gap-5">
          <ScenarioRequest />
          <StatusCard />
          <RepairAlert />
          <ScenarioBrief />
        </div>
        <div className="flex flex-col gap-5">
          <SemanticPreview />
          <EsminiPlayback />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
