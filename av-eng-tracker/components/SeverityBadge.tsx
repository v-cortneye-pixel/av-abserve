import type { Severity } from "@/lib/data";

const STYLES: Record<Severity, string> = {
  P0: "bg-red-50 text-zillow-red ring-1 ring-inset ring-red-200",
  P1: "bg-orange-50 text-zillow-orange ring-1 ring-inset ring-orange-200",
  P2: "bg-yellow-50 text-yellow-800 ring-1 ring-inset ring-yellow-200",
  P3: "bg-blue-50 text-zillow-blue ring-1 ring-inset ring-blue-200",
};

const LABELS: Record<Severity, string> = {
  P0: "P0 Critical",
  P1: "P1 High",
  P2: "P2 Medium",
  P3: "P3 Low",
};

export default function SeverityBadge({ severity }: { severity: Severity }) {
  return <span className={`z-chip ${STYLES[severity]}`}>{LABELS[severity]}</span>;
}
