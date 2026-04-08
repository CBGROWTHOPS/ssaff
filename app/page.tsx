"use client";

import dynamic from "next/dynamic";

const BrainGraph = dynamic(
  () => import("@/components/brain/BrainGraph"),
  { ssr: false }
);

export default function BrainPage() {
  return (
    <main className="relative min-h-screen" style={{ background: "#060608" }}>
      <BrainGraph />
      <div className="pointer-events-none fixed top-0 left-0 right-0 z-20 flex flex-col items-center pt-16">
        <span
          style={{
            fontSize: 10,
            fontWeight: 400,
            letterSpacing: "0.2em",
            color: "rgba(255, 255, 255, 0.25)",
            textTransform: "uppercase",
          }}
        >
          Agentic marketing infrastructure
        </span>
      </div>
      <footer
        className="fixed bottom-0 left-0 right-0 z-10 flex flex-col items-center justify-center gap-1 py-6"
        style={{ fontSize: 11, fontWeight: 400, color: "rgba(255, 255, 255, 0.15)" }}
      >
        <span style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          private system architecture
        </span>
        <span className="opacity-60">&copy; 2026 SSAFF</span>
      </footer>
    </main>
  );
}
