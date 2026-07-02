import type { Metadata } from "next";
import Link from "next/link";
import { posts } from "@/content/blog/posts";

const INK = "#16161A";
const MUTED = "rgba(22,22,26,0.42)";
const FAINT = "rgba(22,22,26,0.30)";
const BG = "#FAFAF7";
const display = "var(--font-space-grotesk), sans-serif";
const ui = "var(--font-inter), sans-serif";

export const metadata: Metadata = {
  title: "The Desk — SSAFF",
  description:
    "The SSAFF culture desk. Notes on hip-hop, moguls, streetwear, and the moves shaping the culture.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "The Desk — SSAFF",
    description:
      "The SSAFF culture desk. Notes on hip-hop, moguls, streetwear, and the moves shaping the culture.",
    url: "https://ssaff.co/blog",
    type: "website",
  },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function BlogIndex() {
  const [featured, ...rest] = posts;

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
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
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
            marginBottom: 64,
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
          The Desk
        </div>

        <h1
          style={{
            fontFamily: display,
            fontWeight: 300,
            fontSize: "clamp(48px, 8vw, 96px)",
            letterSpacing: "-0.03em",
            lineHeight: 1.02,
            margin: 0,
            marginBottom: 24,
            color: INK,
            maxWidth: 900,
          }}
        >
          Notes on the culture.
        </h1>

        <p
          style={{
            fontFamily: display,
            fontWeight: 300,
            fontSize: "clamp(17px, 1.8vw, 20px)",
            lineHeight: 1.55,
            color: "rgba(22,22,26,0.62)",
            maxWidth: 640,
            margin: 0,
            marginBottom: 96,
          }}
        >
          Hip-hop, moguls, streetwear, and the moves shaping the culture —
          from the SSAFF desk in Miami.
        </p>

        {featured && (
          <Link
            href={`/blog/${featured.slug}`}
            style={{
              display: "block",
              padding: "48px 0",
              borderTop: "1px solid rgba(22,22,26,0.12)",
              borderBottom: "1px solid rgba(22,22,26,0.12)",
              textDecoration: "none",
              color: INK,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                fontFamily: ui,
                fontSize: 11,
                letterSpacing: "0.26em",
                textTransform: "uppercase",
                color: MUTED,
                marginBottom: 20,
              }}
            >
              {featured.eyebrow} · Featured
            </div>
            <h2
              style={{
                fontFamily: display,
                fontWeight: 300,
                fontSize: "clamp(32px, 5vw, 60px)",
                letterSpacing: "-0.025em",
                lineHeight: 1.06,
                color: INK,
                margin: 0,
                marginBottom: 24,
                maxWidth: 900,
              }}
            >
              {featured.title}
            </h2>
            <p
              style={{
                fontFamily: display,
                fontWeight: 300,
                fontSize: "clamp(17px, 1.8vw, 21px)",
                lineHeight: 1.5,
                color: "rgba(22,22,26,0.7)",
                maxWidth: 720,
                margin: 0,
                marginBottom: 24,
              }}
            >
              {featured.excerpt}
            </p>
            <div
              style={{
                fontFamily: ui,
                fontSize: 12,
                letterSpacing: "0.08em",
                color: MUTED,
              }}
            >
              {formatDate(featured.published)} · {featured.reading} · {featured.author}
            </div>
          </Link>
        )}

        {rest.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 0,
              borderTop: "1px solid rgba(22,22,26,0.10)",
              marginTop: 40,
            }}
          >
            {rest.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                style={{
                  display: "block",
                  padding: "32px 20px 32px 4px",
                  borderBottom: "1px solid rgba(22,22,26,0.10)",
                  borderRight: "1px solid rgba(22,22,26,0.10)",
                  textDecoration: "none",
                  color: INK,
                }}
              >
                <div
                  style={{
                    fontFamily: ui,
                    fontSize: 11,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: MUTED,
                    marginBottom: 14,
                  }}
                >
                  {p.eyebrow}
                </div>
                <div
                  style={{
                    fontFamily: display,
                    fontWeight: 300,
                    fontSize: "clamp(20px, 2.4vw, 26px)",
                    letterSpacing: "-0.02em",
                    lineHeight: 1.16,
                    color: INK,
                    marginBottom: 14,
                  }}
                >
                  {p.title}
                </div>
                <div
                  style={{
                    fontFamily: ui,
                    fontSize: 11,
                    color: MUTED,
                    letterSpacing: "0.06em",
                  }}
                >
                  {formatDate(p.published)} · {p.reading}
                </div>
              </Link>
            ))}
          </div>
        )}

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
          <Link href="/" style={{ color: FAINT, textDecoration: "none" }}>Home</Link>
          <Link href="/about" style={{ color: FAINT, textDecoration: "none" }}>About</Link>
          <Link href="/partners" style={{ color: FAINT, textDecoration: "none" }}>Partners</Link>
          <Link href="/contact" style={{ color: FAINT, textDecoration: "none" }}>Contact</Link>
          <a href="/blog/feed.xml" style={{ color: FAINT, textDecoration: "none" }}>RSS</a>
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
