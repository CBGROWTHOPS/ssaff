import { posts } from "@/content/blog/posts";

const BASE = "https://ssaff.co";

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
      default: return c;
    }
  });
}

export function GET() {
  const items = posts
    .map((p) => {
      const url = `${BASE}/blog/${p.slug}`;
      const pubDate = new Date(p.published).toUTCString();
      return `
    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(p.excerpt)}</description>
      <category>${escapeXml(p.eyebrow)}</category>
      <author>${escapeXml(p.author)}</author>
    </item>`;
    })
    .join("");

  const lastBuild = new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>The Desk — SSAFF</title>
    <link>${BASE}/blog</link>
    <atom:link href="${BASE}/blog/feed.xml" rel="self" type="application/rss+xml"/>
    <description>Notes on the culture from the SSAFF desk in Miami.</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
