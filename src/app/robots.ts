import type { MetadataRoute } from "next";

const BASE = "https://www.paktechjobs.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // All crawlers
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/recruiter/dashboard",
          "/recruiter/analytics",
          "/recruiter/ai-tools",
          "/recruiter/jobs/new",
          "/dashboard/",
          "/login",
          "/register",
        ],
      },
      {
        // Google — full access to public content
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/", "/admin/", "/dashboard/"],
      },
      {
        // Bing
        userAgent: "Bingbot",
        allow: "/",
        disallow: ["/api/", "/admin/", "/dashboard/"],
      },
      {
        // Block AI training scrapers that don't respect llms.txt
        userAgent: "GPTBot",
        disallow: ["/api/", "/admin/", "/dashboard/"],
        allow: ["/", "/jobs", "/salaries", "/tools", "/resources", "/courses"],
      },
      {
        userAgent: "Claude-Web",
        disallow: ["/api/", "/admin/", "/dashboard/"],
        allow: ["/", "/jobs", "/salaries", "/tools", "/resources", "/courses"],
      },
      {
        userAgent: "anthropic-ai",
        disallow: ["/api/", "/admin/", "/dashboard/"],
        allow: ["/", "/jobs", "/salaries", "/tools", "/resources", "/courses"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
