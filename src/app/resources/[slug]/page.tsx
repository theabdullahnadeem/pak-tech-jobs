import { resources, getResourceBySlug } from "@/data/resources";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return resources.map((resource) => ({ slug: resource.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const resource = getResourceBySlug(slug);
  if (!resource) return { title: "Resource Not Found" };

  return {
    title: resource.title,
    description: resource.excerpt,
    openGraph: {
      title: resource.title,
      description: resource.excerpt,
      type: "article",
    },
  };
}

export default async function ResourcePage({ params }: PageProps) {
  const { slug } = await params;
  const resource = getResourceBySlug(slug);

  if (!resource) {
    notFound();
  }

  // Simple markdown-like renderer
  const renderContent = (content: string) => {
    const lines = content.trim().split("\n");
    const elements: React.ReactNode[] = [];
    let inTable = false;
    let tableRows: string[][] = [];

    const flushTable = () => {
      if (tableRows.length > 0) {
        elements.push(
          <div key={`table-${elements.length}`} className="overflow-x-auto my-4">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border dark:border-border-dark">
                  {tableRows[0].map((cell, i) => (
                    <th key={i} className="text-left py-2 px-3 font-semibold text-muted">
                      {cell.trim()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.slice(2).map((row, ri) => (
                  <tr
                    key={ri}
                    className="border-b border-border/50 dark:border-border-dark/50"
                  >
                    {row.map((cell, ci) => (
                      <td key={ci} className="py-2 px-3">
                        {cell.trim()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
      }
      inTable = false;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith("|")) {
        inTable = true;
        tableRows.push(line.split("|").filter(Boolean));
        continue;
      } else if (inTable) {
        flushTable();
      }

      if (line.startsWith("## ")) {
        elements.push(
          <h2 key={i} className="text-2xl font-bold mt-8 mb-4">
            {line.replace("## ", "")}
          </h2>
        );
      } else if (line.startsWith("### ")) {
        elements.push(
          <h3 key={i} className="text-lg font-semibold mt-6 mb-3">
            {line.replace("### ", "")}
          </h3>
        );
      } else if (line.startsWith("- **")) {
        const match = line.match(/- \*\*(.+?)\*\*:?\s*(.*)/);
        if (match) {
          elements.push(
            <li key={i} className="ml-4 mb-1 text-muted list-disc">
              <strong className="text-foreground">{match[1]}</strong>
              {match[2] ? `: ${match[2]}` : ""}
            </li>
          );
        }
      } else if (line.startsWith("- ")) {
        elements.push(
          <li key={i} className="ml-4 mb-1 text-muted list-disc">
            {line.replace("- ", "")}
          </li>
        );
      } else if (line.match(/^\d+\.\s/)) {
        elements.push(
          <li key={i} className="ml-4 mb-1 text-muted list-decimal">
            {line.replace(/^\d+\.\s/, "")}
          </li>
        );
      } else if (line.trim() === "") {
        // skip empty lines
      } else {
        elements.push(
          <p key={i} className="text-muted leading-relaxed mb-3">
            {line}
          </p>
        );
      }
    }

    if (inTable) flushTable();
    return elements;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Breadcrumb */}
      <nav className="mb-8 text-sm text-muted">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/resources" className="hover:text-primary transition-colors">Resources</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground truncate">{resource.title.slice(0, 40)}...</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
            {resource.category}
          </span>
          <span className="text-xs text-muted">{resource.readTime}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">{resource.title}</h1>
        <p className="text-lg text-muted">{resource.excerpt}</p>
      </div>

      {/* Content */}
      <article className="mb-12">{renderContent(resource.content)}</article>

      {/* Back link */}
      <div className="text-center pt-8 border-t border-border dark:border-border-dark">
        <Link
          href="/resources"
          className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium transition-colors"
        >
          ← Back to all resources
        </Link>
      </div>
    </div>
  );
}
