import { AnimatePresence, motion } from "framer-motion";
import { PipelineStepper } from "./advanced/PipelineStepper";
import { StageDetail } from "./advanced/StageDetail";

export function AdvancedView() {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="advanced"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        className="flex min-w-0 flex-col gap-5"
      >
        <PipelineStepper />
        <StageDetail />
      </motion.div>
    </AnimatePresence>
  );
}
