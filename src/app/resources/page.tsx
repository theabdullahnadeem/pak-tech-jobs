import Link from "next/link";
import { resources } from "@/data/resources";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tech Career Resources & Guides — Pakistan",
  description:
    "Expert guides, career tips, and resources for tech professionals in Pakistan. Learn skills, negotiate salaries, and grow your career.",
  openGraph: {
    title: "Tech Career Resources Pakistan",
    description: "Expert guides and career tips for Pakistan's tech professionals.",
  },
};

export default function ResourcesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">
          Career <span className="gradient-text">Resources & Guides</span>
        </h1>
        <p className="text-muted max-w-2xl mx-auto text-lg">
          Expert guides and actionable tips to help you navigate and grow in Pakistan&apos;s tech industry.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {resources.map((resource) => (
          <Link
            key={resource.slug}
            href={`/resources/${resource.slug}`}
            className="group block p-6 rounded-2xl border border-border dark:border-border-dark bg-card dark:bg-card-dark hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                    {resource.category}
                  </span>
                  <span className="text-xs text-muted">{resource.readTime}</span>
                </div>
                <h2 className="text-lg font-semibold group-hover:text-primary transition-colors mb-2">
                  {resource.title}
                </h2>
                <p className="text-muted text-sm line-clamp-2">{resource.excerpt}</p>
              </div>
              <span className="text-primary text-xl group-hover:translate-x-1 transition-transform flex-shrink-0 mt-2">
                →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
