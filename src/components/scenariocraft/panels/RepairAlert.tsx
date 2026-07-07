import { AlertTriangle } from "lucide-react";
import { repairFailures } from "@/lib/scenariocraft/mockData";

export function RepairAlert() {
  return (
    <section className="rounded-2xl border border-coral/25 bg-coral-soft p-5 shadow-card">
      <header className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
        <AlertTriangle className="h-4 w-4 text-coral" />
        Repair Needed
      </header>
      <ul className="mt-3 space-y-2.5">
        {repairFailures.map((f) => (
          <li key={f.id} className="flex gap-3 text-sm leading-relaxed">
            <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-coral" />
            <div className="min-w-0">
              <div className="font-mono text-[12.5px] text-foreground">{f.id}</div>
              <div className="text-muted-foreground">{f.reason}</div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
