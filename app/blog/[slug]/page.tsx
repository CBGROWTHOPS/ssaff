import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, posts } from "@/content/blog/posts";

const INK = "#16161A";
const MUTED = "rgba(22,22,26,0.42)";
const FAINT = "rgba(22,22,26,0.30)";
const BG = "#FAFAF7";
const display = "var(--font-space-grotesk), sans-serif";
const ui = "var(--font-inter), sans-serif";

type Params = { slug: string };

export async function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Not found — SSAFF" };
  return {
    title: `${post.title} — SSAFF`,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://ssaff.co/blog/${post.slug}`,
      type: "article",
      publishedTime: post.published,
      authors: [post.author],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function BlogPost({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    author: { "@type": "Organization", name: post.author },
    publisher: {
      "@type": "Organization",
      name: "SSAFF LLC",
      url: "https://ssaff.co",
    },
    datePublished: post.published,
    dateModified: post.published,
    mainEntityOfPage: `https://ssaff.co/blog/${post.slug}`,
  };

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <Link
          href="/blog"
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
          {post.eyebrow}
        </div>

        <h1
          style={{
            fontFamily: display,
            fontWeight: 300,
            fontSize: "clamp(36px, 6.4vw, 68px)",
            letterSpacing: "-0.025em",
            lineHeight: 1.06,
            margin: 0,
            marginBottom: 24,
            color: INK,
          }}
        >
          {post.title}
        </h1>

        <div
          style={{
            fontFamily: ui,
            fontSize: 12,
            letterSpacing: "0.08em",
            color: MUTED,
            marginBottom: 56,
          }}
        >
          {formatDate(post.published)} · {post.reading} · {post.author}
        </div>

        <article
          style={{
            fontFamily: display,
            fontWeight: 300,
            fontSize: "clamp(18px, 2.1vw, 21px)",
            lineHeight: 1.65,
            color: "rgba(22,22,26,0.82)",
          }}
          className="ssaff-article"
        >
          {post.Body()}
        </article>

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
          <Link href="/blog" style={{ color: FAINT, textDecoration: "none" }}>
            ← Back to the desk
          </Link>
          <Link href="/" style={{ color: FAINT, textDecoration: "none" }}>Home</Link>
          <Link href="/about" style={{ color: FAINT, textDecoration: "none" }}>About</Link>
          <Link href="/contact" style={{ color: FAINT, textDecoration: "none" }}>Contact</Link>
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
          SSAFF LLC · © 2026
        </div>
      </div>

      <style>{`
        .ssaff-article p { margin: 0 0 24px; }
        .ssaff-article p:last-child { margin-bottom: 0; }
        .ssaff-article a { color: ${INK}; text-decoration: underline; text-underline-offset: 3px; }
        .ssaff-article h2 { font-family: ${display}; font-weight: 300; font-size: clamp(24px, 3vw, 32px); letter-spacing: -0.02em; margin: 48px 0 20px; line-height: 1.15; color: ${INK}; }
        .ssaff-article blockquote { margin: 32px 0; padding-left: 24px; border-left: 2px solid rgba(22,22,26,0.20); font-style: italic; }
      `}</style>
    </main>
  );
}
