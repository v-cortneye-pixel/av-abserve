import type { Quote } from "@/lib/data";

export default function QuoteCard({ quote }: { quote: Quote }) {
  return (
    <div className="rounded-lg border-l-4 border-zillow-blue bg-zillow-gray-light p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-zillow-ink">{quote.who}</span>
        <span className="font-mono text-xs text-zillow-slate">{quote.when}</span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-zillow-ink">&ldquo;{quote.text}&rdquo;</p>
      {(quote.permalink || quote.sourceUrl) && (
        <div className="mt-3 flex flex-wrap gap-3 text-xs">
          {quote.permalink && (
            <a
              href={quote.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="z-link inline-flex items-center gap-1"
            >
              <span>View in Slack</span>
              <span aria-hidden="true">↗</span>
            </a>
          )}
          {quote.sourceUrl && (
            <a
              href={quote.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="z-link inline-flex items-center gap-1"
            >
              <span>{quote.sourceLabel ?? "Source"}</span>
              <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
}
