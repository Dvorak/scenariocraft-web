import { Eye } from "lucide-react";
import { Card } from "../primitives";

export function SemanticPreview() {
  return (
    <Card title="Preview 2D Semantic" icon={<Eye className="h-4 w-4" />} padded={false}>
      <div className="p-5">
        <div className="overflow-hidden rounded-xl border border-border/70 bg-surface">
          <svg viewBox="0 0 800 260" className="block h-auto w-full" role="img" aria-label="Top-down road semantic preview">
            {/* sidewalks */}
            <rect x="0" y="0" width="800" height="34" fill="#efe8dc" />
            <rect x="0" y="226" width="800" height="34" fill="#efe8dc" />
            {/* opposing lane */}
            <rect x="0" y="34" width="800" height="60" fill="#c8c8ce" />
            {/* center divider */}
            <rect x="0" y="94" width="800" height="6" fill="#ffffff" />
            {/* ego lane */}
            <rect x="0" y="100" width="800" height="60" fill="#b6b6bd" />
            {/* parking strip */}
            <rect x="0" y="160" width="800" height="66" fill="#a9a9b0" />

            {/* opposing arrow */}
            <line x1="240" y1="64" x2="330" y2="64" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
            <polyline points="322,58 332,64 322,70" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />

            {/* ego direction arrow (implicit via ego block moving right; but original shows opposing) */}

            {/* trigger diamond */}
            <g transform="translate(430,130)">
              <polygon points="0,-7 7,0 0,7 -7,0" fill="#8a7bd6" stroke="#5b4bb8" strokeWidth="1" />
            </g>
            {/* conflict point circle */}
            <circle cx="330" cy="130" r="6" fill="#fff2c9" stroke="#d1a637" strokeWidth="1.5" />

            {/* pedestrian */}
            <rect x="326" y="184" width="10" height="10" rx="1" fill="#e67e2e" />
            {/* pedestrian crossing path (dashed) */}
            <line x1="331" y1="184" x2="331" y2="115" stroke="#dc4a3a" strokeWidth="1.6" strokeDasharray="4 4" />

            {/* parked van */}
            <rect x="380" y="176" width="72" height="34" rx="2" fill="#3b6bd6" />
            {/* ego */}
            <rect x="600" y="112" width="72" height="34" rx="3" fill="#131313" />
            {/* ego direction arrow */}
            <line x1="620" y1="129" x2="560" y2="129" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
            <polyline points="568,124 558,129 568,134" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          </svg>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-xs md:grid-cols-4">
          <Legend swatch={<span className="h-3 w-3 rounded-sm bg-black" />} label="Ego vehicle" />
          <Legend swatch={<span className="h-3 w-3 rounded-sm" style={{ background: "#3b6bd6" }} />} label="Parked van" />
          <Legend swatch={<span className="h-3 w-3 rounded-sm" style={{ background: "#e67e2e" }} />} label="Pedestrian" />
          <Legend swatch={<span className="h-3 w-3 rotate-45" style={{ background: "#8a7bd6" }} />} label="Trigger point" />
          <Legend swatch={<span className="h-[2px] w-4" style={{ background: "repeating-linear-gradient(90deg,#dc4a3a 0 4px,transparent 4px 8px)" }} />} label="Pedestrian crossing path" />
          <Legend swatch={<span className="block h-3 w-3 rounded-full border border-[#d1a637] bg-[#fff2c9]" />} label="Conflict point" />
        </div>
      </div>
    </Card>
  );
}

function Legend({ swatch, label }: { swatch: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <span className="grid h-4 w-4 place-items-center">{swatch}</span>
      <span>{label}</span>
    </div>
  );
}
