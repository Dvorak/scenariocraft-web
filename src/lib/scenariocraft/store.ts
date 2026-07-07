import { create } from "zustand";
import {
  demoStageStatus,
  initialStageStatus,
  type StageId,
  type StageStatus,
} from "./mockData";

type View = "workspace" | "advanced";

type State = {
  view: View;
  activeStage: StageId;
  request: string;
  preset: string;
  status: Record<StageId, StageStatus>;
  hasRun: boolean;
  running: boolean;
  playbackTime: number;
  setView: (v: View) => void;
  setStage: (s: StageId) => void;
  setRequest: (r: string) => void;
  setPreset: (p: string) => void;
  setPlaybackTime: (t: number) => void;
  generate: () => Promise<void>;
  reset: () => void;
};

const walkOrder: StageId[] = [
  "intent",
  "spec",
  "build",
  "checks",
  "metrics",
  "quality",
  "simulation",
  "repair",
];

export const useScenarioStore = create<State>((set, get) => ({
  view: "workspace",
  activeStage: "intent",
  request:
    "A rainy urban pedestrian occlusion scenario where the ego vehicle approaches a parked van and a pedestrian suddenly crosses from behind it.",
  preset: "Normal Good Scenario",
  status: { ...demoStageStatus },
  hasRun: true,
  running: false,
  playbackTime: 4.45,
  setView: (view) => set({ view }),
  setStage: (activeStage) => set({ activeStage }),
  setRequest: (request) => set({ request }),
  setPreset: (preset) => set({ preset }),
  setPlaybackTime: (playbackTime) => set({ playbackTime }),
  generate: async () => {
    if (get().running) return;
    set({ running: true, status: { ...initialStageStatus }, hasRun: false, activeStage: "intent" });
    for (const stage of walkOrder) {
      set((s) => ({ status: { ...s.status, [stage]: "running" }, activeStage: stage }));
      await new Promise((r) => setTimeout(r, 380));
      set((s) => ({
        status: { ...s.status, [stage]: demoStageStatus[stage] },
      }));
    }
    set({ running: false, hasRun: true, activeStage: "intent" });
  },
  reset: () =>
    set({
      status: { ...initialStageStatus },
      hasRun: false,
      activeStage: "intent",
      playbackTime: 0,
    }),
}));
