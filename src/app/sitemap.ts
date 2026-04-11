import type { MetadataRoute } from "next";
import { salaryRoles } from "@/data/salaries";
import { tools } from "@/data/tools";
import { resources } from "@/data/resources";
import { courses } from "@/data/courses";
import { prisma } from "@/lib/prisma";

const BASE = "https://www.paktechjobs.com";
const now = new Date();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ── Core pages ──────────────────────────────────────────────────────────────
  const core: MetadataRoute.Sitemap = [
    { url: BASE,                                    lastModified: now, changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE}/jobs`,                          lastModified: now, changeFrequency: "hourly",  priority: 1.0 },
    { url: `${BASE}/salaries`,                      lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE}/courses`,                       lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE}/tools`,                         lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/resources`,                     lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/about`,                         lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/contact`,                       lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/register`,                      lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/privacy`,                       lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE}/terms`,                         lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
  ];

  const categoryPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/remote-jobs`,                   lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/frontend-jobs`,                 lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/backend-jobs`,                  lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/react-jobs-pakistan`,           lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/nodejs-jobs-pakistan`,          lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/mern-jobs-pakistan`,            lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/ai-jobs-pakistan`,              lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/devops-jobs-pakistan`,          lastModified: now, changeFrequency: "daily",   priority: 0.8 },
    { url: `${BASE}/internships-pakistan`,          lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/fresh-graduate-it-jobs`,        lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/jobs-in-lahore`,                lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/jobs-in-karachi`,               lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/jobs-in-islamabad`,             lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/market/demand`,                 lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE}/market/salaries`,               lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
  ];

  // ── Live job posts from DB ───────────────────────────────────────────────────
  let jobPages: MetadataRoute.Sitemap = [];
  try {
    const jobs = await prisma.jobPost.findMany({
      where: { isActive: true, isClosed: false },
      select: { id: true, updatedAt: true },
      orderBy: { createdAt: "desc" },
      take: 1000,
    });
    jobPages = jobs.map((job) => ({
      url: `${BASE}/jobs/${job.id}`,
      lastModified: job.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // Non-fatal — sitemap still works without DB jobs
  }

  const salaryPages: MetadataRoute.Sitemap = salaryRoles.map((role) => ({
    url: `${BASE}/salary/${role.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  const toolPages: MetadataRoute.Sitemap = tools.map((tool) => ({
    url: `${BASE}/tools/${tool.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const resourcePages: MetadataRoute.Sitemap = resources.map((resource) => ({
    url: `${BASE}/resources/${resource.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  const coursePages: MetadataRoute.Sitemap = courses.map((course) => ({
    url: `${BASE}/courses/${course.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    ...core,
    ...categoryPages,
    ...jobPages,
    ...salaryPages,
    ...toolPages,
    ...resourcePages,
    ...coursePages,
  ];
}
