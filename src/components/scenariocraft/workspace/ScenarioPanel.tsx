import { FileText, SlidersHorizontal } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "../primitives";
import { RevisionParameterControls } from "../panels/RevisionPanel";
import { ScenarioBriefContent } from "../panels/ScenarioBrief";

export function ScenarioPanel() {
  return (
    <Tabs defaultValue="summary" className="min-h-0">
      <Card
        title="Scenario"
        icon={<FileText className="h-4 w-4" />}
        action={
          <TabsList className="h-8 border border-border bg-surface-muted p-0.5">
            <TabsTrigger value="summary" className="h-7 px-3 text-[10px]">
              Summary
            </TabsTrigger>
            <TabsTrigger value="adjust" className="h-7 gap-1.5 px-3 text-[10px]">
              <SlidersHorizontal className="h-3 w-3" />
              Adjust
            </TabsTrigger>
          </TabsList>
        }
        padded={false}
        bodyClassName="min-h-0"
        className="grid h-full min-h-[300px] grid-rows-[auto_minmax(0,1fr)]"
      >
        <TabsContent value="summary" className="mt-0 h-full min-h-0">
          <ScenarioBriefContent />
        </TabsContent>
        <TabsContent value="adjust" className="mt-0 h-full min-h-0">
          <RevisionParameterControls />
        </TabsContent>
      </Card>
    </Tabs>
  );
}
