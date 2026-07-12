import type { Metadata } from "next";
import Link from "next/link";

const INK = "#16161A";
const MUTED = "rgba(22,22,26,0.42)";
const FAINT = "rgba(22,22,26,0.30)";
const BG = "#FAFAF7";
const display = "var(--font-space-grotesk), sans-serif";
const ui = "var(--font-inter), sans-serif";

export const metadata: Metadata = {
  title: "Properties — SSAFF",
  description: "Owned brands operated by SSAFF.",
  robots: { index: false, follow: false },
};

type Property = {
  name: string;
  domain: string;
  category: string;
  url?: string;
};

const PROPERTIES: Property[] = [
  {
    name: "DriverStart",
    domain: "driverstart.com",
    category: "Gig economy · Driver onboarding",
    url: "https://driverstart.vercel.app",
  },
  {
    name: "QuickCash Fund",
    domain: "quickcashfund.com",
    category: "Financial · Personal loans",
    url: "https://astoria-payday.vercel.app",
  },
  {
    name: "AutoApprove Now",
    domain: "autoapprovenow.com",
    category: "Financial · Auto finance",
    url: "https://astoria-auto-finance.vercel.app",
  },
  {
    name: "Vera",
    domain: "verahealth.com",
    category: "Health · GLP-1 weight loss",
    url: "https://getvera.vercel.app",
  },
  {
    name: "GameFlow Labs",
    domain: "gameflowlabs.com",
    category: "Gaming · Rewards",
  },
  {
    name: "Baby Deals Network",
    domain: "babydealsnetwork.com",
    category: "Family · Sampling",
  },
  {
    name: "Loopteam Creators",
    domain: "creators.loopteam.app",
    category: "Creator network",
  },
  {
    name: "Capmaxxer",
    domain: "capmaxxer.com",
    category: "DTC · E-commerce",
  },
];

export default function PropertiesPage() {
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
          Owned &amp; Operated
        </div>

        <h1
          style={{
            fontFamily: display,
            fontWeight: 300,
            fontSize: "clamp(36px, 6vw, 56px)",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            margin: 0,
            marginBottom: 56,
            color: INK,
          }}
        >
          Properties
        </h1>

        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            borderTop: "1px solid rgba(22,22,26,0.08)",
          }}
        >
          {PROPERTIES.map((p) => {
            const target = p.url ?? `https://${p.domain}`;
            return (
              <li
                key={p.domain}
                style={{
                  borderBottom: "1px solid rgba(22,22,26,0.08)",
                  padding: "28px 0",
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: 24,
                }}
              >
                <div>
                  <a
                    href={target}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: display,
                      fontWeight: 300,
                      fontSize: "clamp(22px, 3.4vw, 30px)",
                      letterSpacing: "-0.02em",
                      color: INK,
                      textDecoration: "none",
                    }}
                  >
                    {p.name}
                  </a>
                  <div
                    style={{
                      fontFamily: ui,
                      fontSize: 11,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: MUTED,
                      marginTop: 6,
                    }}
                  >
                    {p.category}
                  </div>
                </div>
                <a
                  href={target}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: ui,
                    fontSize: 13,
                    color: MUTED,
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  {p.domain} ↗
                </a>
              </li>
            );
          })}
        </ul>

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
          <Link href="/partners" style={{ color: FAINT, textDecoration: "none" }}>
            Partners
          </Link>
          <Link href="/contact" style={{ color: FAINT, textDecoration: "none" }}>
            Contact
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
