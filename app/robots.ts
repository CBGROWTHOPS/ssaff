import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/properties", "/api/"],
      },
    ],
    sitemap: "https://ssaff.co/sitemap.xml",
    host: "https://ssaff.co",
  };
}
