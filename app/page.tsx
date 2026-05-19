"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";
import SmoothScroll from "@/components/home/SmoothScroll";

const NeuralForm = dynamic(() => import("@/components/lab/NeuralForm"), {
  ssr: false,
});

const INK = "#16161A";
const MUTED = "rgba(22,22,26,0.42)";
const FAINT = "rgba(22,22,26,0.30)";
const BG = "#FAFAF7";
const display = "var(--font-space-grotesk), sans-serif";
const ui = "var(--font-inter), sans-serif";

const BEATS = [
  { at: [0.0, 0.18], label: "SSAFF", line: "One system." },
  {
    at: [0.3, 0.5],
    label: "what it does",
    line: "create. allocate. attribute. return.",
  },
  {
    at: [0.62, 0.82],
    label: "principle",
    line: "Compound the stack. Never the team.",
  },
  { at: [0.88, 1.0], label: "contact", line: "If you know, you know." },
];

// Bare names only — no thumbnails, no descriptions, no "client".
// Reads as "systems that exist", not a portfolio.
const SYSTEMS: { name: string; href: string }[] = [
  { name: "NA Blinds", href: "https://nablinds.co" },
];

function Beat({
  range,
  label,
  line,
  progress,
}: {
  range: number[];
  label: string;
  line: string;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const [s, e] = range;
  const mid = (s + e) / 2;

  // Function-form transforms keep Framer Motion on the JS animator (the
  // native ScrollTimeline / WAAPI path rejects out-of-[0,1] keyframe offsets).
  const lerp = (a: number, b: number, t: number) =>
    a + (b - a) * Math.min(1, Math.max(0, t));

  const opacity = useTransform(progress, (v) => {
    if (v < s - 0.06 || v > e + 0.06) return 0;
    if (v < s + 0.02) return lerp(0, 1, (v - (s - 0.06)) / 0.08);
    if (v <= e - 0.02) return 1;
    return lerp(1, 0, (v - (e - 0.02)) / 0.08);
  });

  const y = useTransform(progress, (v) => {
    if (v <= mid) return lerp(18, 0, (v - (s - 0.06)) / (mid - (s - 0.06)));
    return lerp(0, -18, (v - mid) / (e + 0.06 - mid));
  });

  return (
    <motion.div
      style={{
        opacity,
        y,
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "0 8vw",
        pointerEvents: "none",
      }}
    >
      <span
        style={{
          fontFamily: ui,
          fontSize: "clamp(10px, 2.6vw, 11px)",
          letterSpacing: "0.26em",
          textTransform: "uppercase",
          color: MUTED,
          marginBottom: 24,
        }}
      >
        {label}
      </span>
      <p
        style={{
          fontFamily: display,
          fontWeight: 300,
          fontSize: "clamp(26px, 6.4vw, 64px)",
          lineHeight: 1.16,
          letterSpacing: "-0.02em",
          color: INK,
          margin: 0,
          maxWidth: 900,
        }}
      >
        {line}
      </p>
    </motion.div>
  );
}

function ScrollHint({
  progress,
}: {
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const scaleY = useTransform(progress, (v) =>
    Math.min(1, Math.max(0, v))
  );
  const opacity = useTransform(progress, (v) =>
    v >= 0.985 ? Math.max(0, 1 - (v - 0.985) / 0.015) : 1
  );
  return (
    <motion.div
      style={{
        opacity,
        position: "fixed",
        right: "clamp(16px, 3vw, 32px)",
        top: "39vh",
        height: "22vh",
        width: 1,
        background: "rgba(22,22,26,0.10)",
        zIndex: 20,
        pointerEvents: "none",
      }}
    >
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          background: "#F0594B",
          transformOrigin: "top",
          scaleY,
        }}
      />
    </motion.div>
  );
}

export default function HomePage() {
  const ref = useRef<HTMLDivElement>(null);
  const scrollVal = useRef(0);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    scrollVal.current = v;
  });

  return (
    <SmoothScroll>
      <main style={{ background: BG }}>
        <ScrollHint progress={scrollYProgress} />
        <div ref={ref} style={{ height: "520vh", position: "relative" }}>
          <div
            style={{
              position: "sticky",
              top: 0,
              height: "100svh",
              overflow: "hidden",
            }}
          >
            <NeuralForm progress={scrollVal} />
            {BEATS.map((b) => (
              <Beat
                key={b.label}
                range={b.at}
                label={b.label}
                line={b.line}
                progress={scrollYProgress}
              />
            ))}
          </div>
        </div>

        <Closing />
      </main>
    </SmoothScroll>
  );
}

function Closing() {
  return (
    <section
      style={{
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 8vw",
        textAlign: "center",
        gap: 0,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.8, ease: (t: number) => 1 - Math.pow(1 - t, 3) }}
        style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        <span
          style={{
            fontFamily: ui,
            fontSize: 11,
            letterSpacing: "0.26em",
            textTransform: "uppercase",
            color: MUTED,
            marginBottom: 40,
          }}
        >
          selected systems
        </span>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 18,
            marginBottom: 96,
          }}
        >
          {SYSTEMS.map((s) => (
            <a
              key={s.name}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              style={{
                fontFamily: display,
                fontWeight: 300,
                fontSize: "clamp(26px, 5.2vw, 48px)",
                letterSpacing: "-0.02em",
                color: INK,
                textDecoration: "none",
                borderBottom: "1px solid transparent",
                paddingBottom: 3,
                transition: "border-color 240ms ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderBottomColor = "#F0594B";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderBottomColor = "transparent";
              }}
            >
              {s.name}
            </a>
          ))}
        </div>

        <a
          href="mailto:chris@ssaff.co"
          style={{
            fontFamily: ui,
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: FAINT,
            textDecoration: "none",
          }}
        >
          chris@ssaff.co
        </a>
        <span
          style={{
            fontFamily: ui,
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: FAINT,
            marginTop: 28,
          }}
        >
          private system architecture · © 2026 SSAFF
        </span>
      </motion.div>
    </section>
  );
}
