# ScenarioCraft — Workspace / Advanced redesign

Anchor the visual language on image 1 (clean cards, coral/red accent, pill toggle, quiet iconography) and rebuild both views inside this Lovable project. Current app is the blank placeholder — this is a from-scratch build of the UI, wired to mock data shaped like the real pipeline so it stays believable.

## Design system

Add to `src/styles.css` (oklch tokens):
- Background `#faf9f6` (warm paper), surface `#ffffff`, border `oklch(0.93 0.005 90)`
- Foreground near-black `oklch(0.18 0.01 260)`, muted `oklch(0.55 0.01 260)`
- Accent `--accent-coral` `oklch(0.68 0.19 25)` (the image-1 red) + `--accent-coral-soft` for tinted backgrounds
- Status: success `oklch(0.72 0.17 145)`, warning `oklch(0.78 0.16 75)`, idle `oklch(0.75 0.01 260)`
- Radius scale 10 / 14 / 20; soft shadow `0 1px 2px rgba(15,15,15,.04), 0 8px 24px -12px rgba(15,15,15,.08)`
- Typography: Inter Tight (display, tight tracking) + Inter (body) + JetBrains Mono (values). Installed via @fontsource.

Three stylistic variants I'll prepare as a single tokens-only swap so you can pick after seeing it live (ask via question in build mode, no rebuild needed):
1. **Clinical Cockpit** — near-white, hairline borders, mono numerics, quiet coral (closest to image 1).
2. **Warm Lab Report** — off-white paper, Instrument Serif headers, terracotta-leaning red.
3. **Instrument Panel** — near-black canvas, glowing coral status dots, grid backdrop.

Default we ship: Clinical Cockpit.

## Routes & structure

- `src/routes/index.tsx` → renders `<ScenarioCraftApp />`, holds the `view: 'workspace' | 'advanced'` state and the mock pipeline store.
- Head metadata: title "ScenarioCraft — Scenario authoring & validation", matching og/twitter.
- Components in `src/components/scenariocraft/`:
  - `AppHeader.tsx` — wordmark + segmented pill toggle (animated indicator).
  - `WorkspaceView.tsx` — 2-col grid.
  - `AdvancedView.tsx` — stepper + synced detail region.
  - `panels/ScenarioRequest.tsx`, `StatusCard.tsx`, `RepairAlert.tsx`, `ScenarioBrief.tsx`
  - `panels/SemanticPreview.tsx` (SVG road/actors/legend), `EsminiPlayback.tsx` (framed still + transport bar).
  - `advanced/PipelineStepper.tsx` (8 nodes, icon + status dot, keyboard accessible), `StageDetail.tsx` (switches on active stage), plus per-stage cards: `IntentSpecCard`, `BuildArtifactsCard`, `RunArtifactsCard`, `ChecksCard`, `MetricsCard`, `EvidenceCard`, `RepairTraceCard`, `QualityCard`, `SimulationCard`.
- Shared UI reuses existing shadcn primitives (Card, Button, Badge, Tabs, Collapsible, Tooltip).

## State (light refactor)

- `src/lib/scenariocraft/store.ts` — Zustand store (add zustand): `view`, `activeStage`, `run` object (intent/spec/build/checks/metrics/quality/simulation/repair with status + payload), `request` text, `preset`. Actions: `setView`, `setStage`, `generate()` (simulated async that walks stages green with staggered timeouts), `reset()`.
- `src/lib/scenariocraft/mockData.ts` — one canonical pedestrian-occlusion run matching image 1's numbers (Target TTC 1.9s, Lead 1.8s, Trigger 1.9s, Ped 3.1s, THW 2.2s; ego 35 km/h, ped 1.5 m/s; failures parked_van_footprint_in_parking_strip, pedestrian_line_of_sight_occluded_by_van; artifacts XOSC/XODR/esmini paths).
- No backend — everything is in-memory. Stage timings are deterministic so demos feel alive.

## Workspace view (image 1 left panel, polished)

- Left column (~460px): Scenario Request card (textarea, attach/image/settings icon row, preset dropdown "Normal Good Scenario", coral play button with hover-pulse when idle) → Status card (4 label/dot pairs in a 2×2 grid) → Repair Needed card (soft coral tint, list of failure IDs with mono ids and plain-language reason) → Scenario Brief card (4 metric tiles top row, ego/pedestrian speed tiles, context line footer).
- Right column: Preview 2D Semantic card (crisp SVG road drawn to scale — lane strips, dashed centerline, ego rect, parked van rect, pedestrian dot, trigger diamond, dashed red crossing path; legend row below) → Playback Esmini card (rounded video-like frame, static hero still, transport bar with play, 1.0x, timeline `4.45 s / 10.00 s`, fullscreen icon).

## Advanced view (image 1 right panel, made interactive)

- Header stays the same, pill toggle switches to Advanced.
- `PipelineStepper`: 8 nodes on a single rail, each with a lucide icon, label, and status dot. Active node has coral ring + subtle scale; connecting rail segments before completed nodes go coral. Clicking a node sets `activeStage`; keyboard left/right also moves it. Reduced-motion respected.
- `StageDetail`: renders the card cluster for the active stage. Right-hand column always shows a persistent Checks summary + Metrics tiles (like image 1) so the board reads as a dashboard even while stages switch on the left. Below the stage-specific cards: External Evidence + Repair Trace (per image 1 bottom row) always visible.
- Stages map to cards:
  - Intent → Intent & Spec card
  - Spec → ScenarioSpec JSON + Template Resolution rows
  - Build → Build Artifacts (XOSC/XODR) + OpenSCENARIO XML preview
  - Checks → detailed Checks list
  - Metrics → expanded Metrics grid
  - Quality → OSC Quality (ASAM QC) breakdown
  - Simulation → Run Artifacts + esmini log tail
  - Repair → Repair Trace detail with patches list

## Motion

- Framer Motion: pill toggle `layoutId` indicator; stepper node hover scale 1.04; card mount `y: 8 → 0`, opacity fade, 220ms; stage swap crossfade 160ms; coral play button `animate-pulse` only while status is idle.

## Accessibility

- Pill toggle is a real `role="tablist"` with `tab`/`tabpanel`. Stepper is `role="tablist"` too. All icons paired with labels or `aria-label`. Focus rings use the coral token at 40% opacity.

## Implementation order

1. Install deps: `zustand`, `framer-motion`, `@fontsource-variable/inter`, `@fontsource/jetbrains-mono`.
2. Tokens + fonts in `src/styles.css` + `src/router.tsx` font imports.
3. Mock store + data.
4. `AppHeader` + shell in `src/routes/index.tsx` (replace placeholder).
5. Workspace panels (left column, then right column).
6. Advanced stepper + synced detail region.
7. Motion polish + a11y pass.
8. Take Playwright screenshots of both views at 1440 wide, verify against image 1, adjust spacing.
9. Ask you to pick between the 3 stylistic variants (single token swap).

## Out of scope

- Real backend, real esmini video, real LLM repair calls, auth, persistence. All mocked.
