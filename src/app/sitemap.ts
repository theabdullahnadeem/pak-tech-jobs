import type { MetadataRoute } from "next";
import { salaryRoles } from "@/data/salaries";
import { tools } from "@/data/tools";
import { resources } from "@/data/resources";
import { courses } from "@/data/courses";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.paktechjobs.com";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/salaries`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/tools`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/resources`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/courses`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/jobs`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  // Dynamic salary pages
  const salaryPages: MetadataRoute.Sitemap = salaryRoles.map((role) => ({
    url: `${baseUrl}/salary/${role.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // Dynamic tool pages
  const toolPages: MetadataRoute.Sitemap = tools.map((tool) => ({
    url: `${baseUrl}/tools/${tool.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // Dynamic resource pages
  const resourcePages: MetadataRoute.Sitemap = resources.map((resource) => ({
    url: `${baseUrl}/resources/${resource.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Dynamic course pages
  const coursePages: MetadataRoute.Sitemap = courses.map((course) => ({
    url: `${baseUrl}/courses/${course.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...salaryPages, ...toolPages, ...resourcePages, ...coursePages];
}
