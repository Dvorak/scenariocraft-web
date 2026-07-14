import { AnimatePresence, motion } from "framer-motion";
import { ScenarioRequest } from "./panels/ScenarioRequest";
import { StatusCard } from "./panels/StatusCard";
import { RepairAlert } from "./panels/RepairAlert";
import { ScenarioBrief } from "./panels/ScenarioBrief";
import { SemanticPreview } from "./panels/SemanticPreview";
import { EsminiPlayback } from "./panels/EsminiPlayback";
import { RevisionPanel } from "./panels/RevisionPanel";

export function WorkspaceView() {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="workspace"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        className="grid gap-5 xl:grid-cols-[minmax(360px,0.82fr)_minmax(620px,1.75fr)]"
      >
        <div className="flex flex-col gap-5">
          <ScenarioRequest />
          <StatusCard />
          <RepairAlert />
          <ScenarioBrief />
          <RevisionPanel />
        </div>
        <div className="flex flex-col gap-5">
          <SemanticPreview />
          <EsminiPlayback />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
