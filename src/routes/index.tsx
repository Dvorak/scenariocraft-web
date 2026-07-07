import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/scenariocraft/AppHeader";
import { WorkspaceView } from "@/components/scenariocraft/WorkspaceView";
import { AdvancedView } from "@/components/scenariocraft/AdvancedView";
import { useScenarioStore } from "@/lib/scenariocraft/store";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const view = useScenarioStore((s) => s.view);
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-6 py-8 lg:px-10 lg:py-10">
        <AppHeader />
        {view === "workspace" ? <WorkspaceView /> : <AdvancedView />}
      </div>
    </div>
  );
}
