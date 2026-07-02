"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import SmoothScroll from "@/components/home/SmoothScroll";
import VideoBackground from "@/components/home/VideoBackground";

const INK = "#16161A";
const MUTED = "rgba(22,22,26,0.42)";
const FAINT = "rgba(22,22,26,0.30)";
const CORAL = "#F0594B";
const BG = "#FAFAF7";
const ON_VIDEO_INK = "#FFFFFF";
const ON_VIDEO_MUTED = "rgba(255,255,255,0.68)";
const display = "var(--font-space-grotesk), sans-serif";
const ui = "var(--font-inter), sans-serif";

type BeatDef = {
  at: number[];
  label: string;
  line: string;
  accent?: string;
  nowrap?: boolean;
  italic?: boolean;
};

const BEATS: BeatDef[] = [
  { at: [0.0, 0.2], label: "Media company", line: "SSAFF" },
  {
    at: [0.35, 0.55],
    label: "Operating",
    line: "Multi-brand publisher.",
    accent: "Branding · Lead generation · E-commerce",
  },
  { at: [0.75, 1.0], label: "Approach", line: "There are no limits." },
];

function Beat({
  range,
  label,
  line,
  accent,
  nowrap,
  italic,
  progress,
}: {
  range: number[];
  label: string;
  line: string;
  accent?: string;
  nowrap?: boolean;
  italic?: boolean;
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
          color: ON_VIDEO_MUTED,
          marginBottom: 24,
        }}
      >
        {label}
      </span>
      <p
        style={{
          fontFamily: display,
          fontWeight: 300,
          fontStyle: italic ? "italic" : "normal",
          fontSize: nowrap
            ? "clamp(17px, 4.6vw, 46px)"
            : "clamp(26px, 6.4vw, 64px)",
          lineHeight: 1.16,
          letterSpacing: italic ? "-0.04em" : "-0.02em",
          color: ON_VIDEO_INK,
          margin: 0,
          maxWidth: nowrap ? "none" : 900,
          whiteSpace: nowrap ? "nowrap" : "normal",
        }}
      >
        {line}
      </p>
      {accent && (
        <p
          style={{
            fontFamily: display,
            fontWeight: 300,
            fontSize: "clamp(20px, 4.6vw, 44px)",
            lineHeight: 1.16,
            letterSpacing: "-0.02em",
            color: CORAL,
            margin: 0,
            marginTop: 14,
            maxWidth: 900,
          }}
        >
          {accent}
        </p>
      )}
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
        background: "rgba(255,255,255,0.22)",
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
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
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
            <VideoBackground progress={scrollYProgress} />
            {BEATS.map((b) => (
              <Beat
                key={b.label}
                range={b.at}
                label={b.label}
                line={b.line}
                accent={b.accent}
                nowrap={b.nowrap}
                italic={b.italic}
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
            fontFamily: display,
            fontWeight: 300,
            fontStyle: "italic",
            fontSize: "clamp(64px, 14vw, 180px)",
            letterSpacing: "-0.04em",
            color: INK,
            lineHeight: 1,
            marginBottom: 96,
          }}
        >
          SSAFF
        </span>

        <div
          style={{
            marginTop: 32,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 24,
            fontFamily: ui,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: MUTED,
          }}
        >
          <Link href="/about" style={{ color: MUTED, textDecoration: "none" }}>
            About
          </Link>
          <Link href="/partners" style={{ color: MUTED, textDecoration: "none" }}>
            Partners
          </Link>
          <Link href="/contact" style={{ color: MUTED, textDecoration: "none" }}>
            Contact
          </Link>
          <Link href="/privacy" style={{ color: MUTED, textDecoration: "none" }}>
            Privacy
          </Link>
          <Link href="/terms" style={{ color: MUTED, textDecoration: "none" }}>
            Terms
          </Link>
        </div>

        <span
          style={{
            fontFamily: ui,
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: FAINT,
            marginTop: 24,
          }}
        >
          media company · © 2026 SSAFF LLC
        </span>
        <span
          style={{
            fontFamily: ui,
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "none",
            color: FAINT,
            marginTop: 6,
          }}
        >
          407 Lincoln Rd Suite 6H PMB 1834, Miami Beach, FL 33139
        </span>
      </motion.div>
    </section>
  );
}
