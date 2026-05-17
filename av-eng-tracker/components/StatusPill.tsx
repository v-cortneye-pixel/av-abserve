const STYLES: Record<string, string> = {
  Open: "bg-red-50 text-zillow-red ring-1 ring-inset ring-red-200",
  Workaround: "bg-yellow-50 text-yellow-800 ring-1 ring-inset ring-yellow-200",
  "In Progress": "bg-blue-50 text-zillow-blue ring-1 ring-inset ring-blue-200",
  Resolved: "bg-green-50 text-zillow-green ring-1 ring-inset ring-green-200",
};

export default function StatusPill({ status }: { status: string }) {
  return <span className={`z-chip ${STYLES[status] ?? "bg-zillow-gray-light text-zillow-slate"}`}>{status}</span>;
}
