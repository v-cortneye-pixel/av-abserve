import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AV Engineer — Windows Laptop Setup",
  description:
    "Cortney's step-by-step setup guide for the new Windows laptop. Get glab, git, AWS CLI, Q-Sys Designer, Cursor, and bookmarks ready in one session.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
