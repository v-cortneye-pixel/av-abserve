"use client";

import { useState } from "react";

export default function CodeBlock({
  code,
  language = "powershell",
  label,
}: {
  code: string;
  language?: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="my-3 overflow-hidden rounded-lg border border-gray-border bg-ink">
      <div className="flex items-center justify-between border-b border-gray-700/40 bg-ink px-3 py-2">
        <span className="font-mono text-[10px] uppercase tracking-wider text-gray">
          {label ?? language}
        </span>
        <button
          onClick={copy}
          className="rounded-md bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-white transition-colors hover:bg-white/20"
        >
          {copied ? "✓ Copied" : "📋 Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-gray-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}
