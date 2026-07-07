export type StageId =
  | "intent"
  | "spec"
  | "build"
  | "checks"
  | "metrics"
  | "quality"
  | "simulation"
  | "repair";

export type StageStatus = "idle" | "running" | "passed" | "warning" | "failed";

export const STAGES: { id: StageId; label: string }[] = [
  { id: "intent", label: "Intent" },
  { id: "spec", label: "Spec" },
  { id: "build", label: "Build" },
  { id: "checks", label: "Checks" },
  { id: "metrics", label: "Metrics" },
  { id: "quality", label: "Quality" },
  { id: "simulation", label: "Simulation" },
  { id: "repair", label: "Repair" },
];

export const initialStageStatus: Record<StageId, StageStatus> = {
  intent: "idle",
  spec: "idle",
  build: "idle",
  checks: "idle",
  metrics: "idle",
  quality: "idle",
  simulation: "idle",
  repair: "idle",
};

export const demoStageStatus: Record<StageId, StageStatus> = {
  intent: "passed",
  spec: "passed",
  build: "passed",
  checks: "passed",
  metrics: "warning",
  quality: "passed",
  simulation: "warning",
  repair: "idle",
};

export const metrics = {
  targetTTC: "1.9 s",
  leadTime: "1.8 s",
  triggerThreshold: "1.9 s",
  pedestrianTime: "3.1 s",
  thw: "2.2 s",
};

export const brief = {
  title: "Pedestrian occlusion",
  egoSpeed: "35 km/h",
  pedestrianSpeed: "1.5 m/s",
  context: "urban_straight, 1 lane(s) per direction, 50 km/h limit · rain / wet road",
};

export const repairFailures = [
  {
    id: "parked_van_footprint_in_parking_strip",
    reason: "Parked van footprint is not fully inside the ego-side parking strip.",
  },
  {
    id: "pedestrian_line_of_sight_occluded_by_van",
    reason: "Ego-to-pedestrian initial line of sight does not intersect the parked van footprint.",
  },
];

export const checks = [
  { label: "Structural Checks", status: "passed" as const },
  { label: "Geometry Checks", status: "passed" as const },
  { label: "Intent Alignment", status: "passed" as const },
  { label: "Artifact Consistency", status: "warning" as const },
];

export const buildArtifacts = [
  { label: "OpenSCENARIO", value: "scenario.xosc", kind: "xosc" as const },
  { label: "OpenDRIVE", value: "urban_two_way_parking.xodr", kind: "xodr" as const },
];

export const runArtifacts = [
  { label: "esmini Scenario", value: "outputs/web_demo/20260707_224433/scenario.esmini" },
  { label: "Logs & Outputs", value: "outputs/web_demo/20260707_224433/logs" },
];

export const externalEvidence = [
  { label: "OSC Quality (ASAM QC)", status: "passed" as const, value: "Passed" },
  { label: "Simulation (esmini)", status: "warning" as const, value: "Warning" },
];

export const repairTrace = [
  { label: "LLM Repair Provider", value: "FakeRepairProvider" },
  { label: "Suggested Operation", value: "reposition_actor" },
  { label: "Patches", value: "1 file" },
];

export const scenarioSpecSample = `{
  "family": "pedestrian_occlusion",
  "seed": 101,
  "ego": { "speed_kph": 35, "lane": "ego_driving" },
  "pedestrian": { "speed_mps": 1.5, "path": "cross_from_behind_van" },
  "parked_van": { "offset_m": 4.96, "lane": "ego_side_parking" },
  "weather": "rainy_wet",
  "trigger": { "threshold_s": 1.9, "offset_m": 16.444 },
  "duration_s": 8.0
}`;

export const openScenarioXmlSample = `<OpenSCENARIO>
  <FileHeader author="ScenarioCraft" revMajor="1" revMinor="2"/>
  <RoadNetwork>
    <LogicFile filepath="urban_two_way_parking.xodr"/>
  </RoadNetwork>
  <Entities>
    <ScenarioObject name="ego"/>
    <ScenarioObject name="parked_van"/>
    <ScenarioObject name="pedestrian"/>
  </Entities>
  <Storyboard>...</Storyboard>
</OpenSCENARIO>`;

export const specRows = [
  { label: "preferred_trigger_latest_s", value: "3.0 s · sampled" },
  { label: "target_min_ttc_s", value: "1.677 s · sampled" },
  { label: "total_duration_s", value: "8.0 s · sampled" },
  { label: "trigger_offset_m", value: "16.444 m · sampled" },
  { label: "van_to_conflict_offset_m", value: "4.96 m · sampled" },
  { label: "weather", value: "rainy_wet · sampled" },
];

export const presets = [
  "Normal Good Scenario",
  "Pedestrian occlusion",
  "Cut-in",
  "Lead vehicle braking",
  "Oncoming turn across path",
];
