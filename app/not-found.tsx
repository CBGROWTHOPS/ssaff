import Link from "next/link";
import type { Metadata } from "next";

const INK = "#16161A";
const MUTED = "rgba(22,22,26,0.42)";
const FAINT = "rgba(22,22,26,0.30)";
const BG = "#FAFAF7";
const display = "var(--font-space-grotesk), sans-serif";
const ui = "var(--font-inter), sans-serif";

export const metadata: Metadata = {
  title: "404 — SSAFF",
  description: "The page you're looking for isn't here.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main
      style={{
        background: BG,
        minHeight: "100svh",
        color: INK,
        fontFamily: ui,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "clamp(28px, 5vw, 48px)",
          left: "clamp(20px, 6vw, 64px)",
          zIndex: 2,
        }}
      >
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
          }}
        >
          SSAFF
        </Link>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "clamp(80px, 12vw, 140px) clamp(20px, 6vw, 64px) clamp(80px, 10vw, 120px)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "relative",
            textAlign: "center",
            maxWidth: 720,
          }}
        >
          <div
            style={{
              position: "relative",
              display: "inline-block",
              lineHeight: 1,
            }}
          >
            <div
              aria-hidden
              style={{
                fontFamily: display,
                fontStyle: "italic",
                fontWeight: 300,
                fontSize: "clamp(180px, 34vw, 380px)",
                letterSpacing: "-0.06em",
                color: INK,
                lineHeight: 0.9,
                userSelect: "none",
                animation: "ssaffDrift 8s ease-in-out infinite",
              }}
            >
              404
            </div>
            <div
              aria-hidden
              style={{
                position: "absolute",
                top: "50%",
                left: "-8%",
                right: "-8%",
                height: 3,
                background: INK,
                transform: "rotate(-4deg) scaleX(0)",
                transformOrigin: "left center",
                animation: "ssaffStrike 1.2s cubic-bezier(0.65, 0, 0.35, 1) 0.4s forwards",
              }}
            />
          </div>

          <div
            style={{
              fontFamily: ui,
              fontSize: 11,
              letterSpacing: "0.26em",
              textTransform: "uppercase",
              color: MUTED,
              marginTop: 32,
              marginBottom: 20,
            }}
          >
            Page not found
          </div>

          <p
            style={{
              fontFamily: display,
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: "clamp(22px, 3.4vw, 32px)",
              letterSpacing: "-0.02em",
              lineHeight: 1.25,
              color: INK,
              margin: 0,
              marginBottom: 40,
            }}
          >
            there are no limits — <br style={{ display: "none" }} />
            except this one.
          </p>

          <Link
            href="/"
            style={{
              fontFamily: ui,
              fontSize: 13,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: INK,
              textDecoration: "none",
              borderBottom: `1px solid ${INK}`,
              paddingBottom: 4,
              display: "inline-block",
            }}
          >
            ← Back to home
          </Link>
        </div>
      </div>

      <div
        style={{
          padding: "24px clamp(20px, 6vw, 64px)",
          display: "flex",
          justifyContent: "space-between",
          gap: 24,
          fontFamily: ui,
          fontSize: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: FAINT,
          borderTop: "1px solid rgba(22,22,26,0.06)",
        }}
      >
        <span>SSAFF LLC · Miami Beach, FL</span>
        <span style={{ display: "flex", gap: 20 }}>
          <Link href="/about" style={{ color: FAINT, textDecoration: "none" }}>
            About
          </Link>
          <Link href="/partners" style={{ color: FAINT, textDecoration: "none" }}>
            Partners
          </Link>
          <Link href="/contact" style={{ color: FAINT, textDecoration: "none" }}>
            Contact
          </Link>
        </span>
      </div>

      <style>{`
        @keyframes ssaffStrike {
          0% { transform: rotate(-4deg) scaleX(0); }
          100% { transform: rotate(-4deg) scaleX(1); }
        }
        @keyframes ssaffDrift {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(-4px) translateY(-6px); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="ssaffStrike"] { animation: none !important; transform: rotate(-4deg) scaleX(1) !important; }
          [style*="ssaffDrift"] { animation: none !important; }
        }
      `}</style>
    </main>
  );
}
