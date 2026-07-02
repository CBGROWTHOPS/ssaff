import type { MetadataRoute } from "next";
import { posts } from "@/content/blog/posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://ssaff.co";
  const lastModified = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified, changeFrequency: "monthly", priority: 1.0 },
    { url: `${base}/about`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/partners`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/contact`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/blog`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/privacy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];
  const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: new Date(p.published),
    changeFrequency: "monthly",
    priority: 0.7,
  }));
  return [...staticRoutes, ...postRoutes];
}
