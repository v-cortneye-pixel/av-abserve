import type { Quote } from "@/lib/data";

export default function QuoteCard({ quote }: { quote: Quote }) {
  return (
    <div className="rounded-lg border-l-4 border-zillow-blue bg-zillow-gray-light p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-zillow-ink">{quote.who}</span>
        <span className="font-mono text-xs text-zillow-slate">{quote.when}</span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-zillow-ink">&ldquo;{quote.text}&rdquo;</p>
    </div>
  );
}
