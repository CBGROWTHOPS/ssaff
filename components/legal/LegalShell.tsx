import Link from "next/link";
import type { ReactNode } from "react";

const INK = "#16161A";
const MUTED = "rgba(22,22,26,0.42)";
const FAINT = "rgba(22,22,26,0.30)";
const BG = "#FAFAF7";
const display = "var(--font-space-grotesk), sans-serif";
const ui = "var(--font-inter), sans-serif";

export default function LegalShell({
  eyebrow,
  title,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <main
      style={{
        background: BG,
        minHeight: "100svh",
        padding: "clamp(48px, 8vw, 96px) clamp(20px, 6vw, 64px) 64px",
        color: INK,
        fontFamily: ui,
      }}
    >
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <Link
          href="/"
          style={{
            fontFamily: display,
            fontStyle: "italic",
            fontWeight: 300,
            fontSize: 28,
            letterSpacing: "-0.04em",
            color: INK,
            textDecoration: "none",
            display: "inline-block",
            marginBottom: 48,
          }}
        >
          SSAFF
        </Link>

        <div
          style={{
            fontFamily: ui,
            fontSize: 11,
            letterSpacing: "0.26em",
            textTransform: "uppercase",
            color: MUTED,
            marginBottom: 18,
          }}
        >
          {eyebrow}
        </div>

        <h1
          style={{
            fontFamily: display,
            fontWeight: 300,
            fontSize: "clamp(36px, 6vw, 56px)",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            margin: 0,
            marginBottom: 12,
            color: INK,
          }}
        >
          {title}
        </h1>

        <div
          style={{
            fontFamily: ui,
            fontSize: 13,
            color: MUTED,
            marginBottom: 56,
          }}
        >
          Last updated {updated}
        </div>

        <div
          style={{
            fontFamily: ui,
            fontSize: 15,
            lineHeight: 1.7,
            color: "rgba(22,22,26,0.78)",
          }}
          className="legal-prose"
        >
          {children}
        </div>

        <div
          style={{
            marginTop: 96,
            paddingTop: 32,
            borderTop: "1px solid rgba(22,22,26,0.08)",
            display: "flex",
            flexWrap: "wrap",
            gap: 28,
            fontFamily: ui,
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: FAINT,
          }}
        >
          <Link href="/" style={{ color: FAINT, textDecoration: "none" }}>
            Home
          </Link>
          <Link href="/about" style={{ color: FAINT, textDecoration: "none" }}>
            About
          </Link>
          <Link href="/partners" style={{ color: FAINT, textDecoration: "none" }}>
            Partners
          </Link>
          <Link href="/contact" style={{ color: FAINT, textDecoration: "none" }}>
            Contact
          </Link>
          <Link href="/privacy" style={{ color: FAINT, textDecoration: "none" }}>
            Privacy
          </Link>
          <Link href="/terms" style={{ color: FAINT, textDecoration: "none" }}>
            Terms
          </Link>
        </div>

        <div
          style={{
            marginTop: 24,
            fontFamily: ui,
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: FAINT,
          }}
        >
          SSAFF LLC · 407 Lincoln Rd Suite 6H PMB 1834, Miami Beach, FL 33139 · © 2026
        </div>
      </div>
    </main>
  );
}
