import { salaryRoles, getSalaryBySlug, formatSalary } from "@/data/salaries";
import { notFound } from "next/navigation";
import Link from "next/link";
import AdSlot from "@/components/AdSlot";
import JobSearchBar from "@/components/JobSearchBar";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return salaryRoles.map((role) => ({ slug: role.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const role = getSalaryBySlug(slug);
  if (!role) return { title: "Role Not Found" };

  return {
    title: role.title,
    description: role.description,
    openGraph: {
      title: role.title,
      description: role.description,
    },
  };
}

export default async function SalaryPage({ params }: PageProps) {
  const { slug } = await params;
  const role = getSalaryBySlug(slug);

  if (!role) {
    notFound();
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: role.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-muted">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/salaries" className="hover:text-primary transition-colors">Salaries</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{role.shortTitle}</span>
        </nav>

        {/* Title + metadata */}
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">{role.title}</h1>
        {/* B2: Last updated date */}
        <p className="text-xs text-muted mb-2">Last updated: March 2026</p>
        {/* B7: Data source note */}
        <p className="text-xs text-muted mb-4 italic">Data compiled from job postings, recruiter surveys &amp; developer reports.</p>
        <p className="text-lg text-muted mb-10">{role.description}</p>

        {/* AdSlot - Post Intro */}
        <div className="mb-12">
          <AdSlot position="post-intro" />
        </div>

        {/* Redirect Intent: Job Search Bar */}
        <div className="mb-12 bg-primary/5 p-6 rounded-3xl border border-primary/20">
          <h3 className="text-xl font-bold mb-4 text-center">Looking for {role.shortTitle} Jobs?</h3>
          <JobSearchBar initialKeyword={role.shortTitle} />
        </div>

        {/* Salary Breakdown */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Salary Breakdown</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Junior (0-1 yr)", range: role.salaryRange.junior, color: "from-blue-500 to-blue-600" },
              { label: "Mid-Level (1-3 yr)", range: role.salaryRange.mid, color: "from-emerald-500 to-emerald-600" },
              { label: "Senior (3+ yr)", range: role.salaryRange.senior, color: "from-purple-500 to-purple-600" },
            ].map((level) => (
              <div
                key={level.label}
                className="p-6 rounded-2xl border border-border dark:border-border-dark bg-card dark:bg-card-dark text-center"
              >
                <span className="text-sm font-medium text-muted block mb-2">{level.label}</span>
                <div className={`text-2xl font-bold bg-gradient-to-r ${level.color} bg-clip-text text-transparent`}>
                  {formatSalary(level.range.min)}
                </div>
                <span className="text-sm text-muted mx-1">to</span>
                <div className={`text-2xl font-bold bg-gradient-to-r ${level.color} bg-clip-text text-transparent`}>
                  {formatSalary(level.range.max)}
                </div>
                <span className="text-xs text-muted block mt-1">per month</span>
              </div>
            ))}
          </div>
        </section>

        {/* Skills */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Key Skills Affecting Salary</h2>
          <div className="flex flex-wrap gap-2">
            {role.skills.map((skill) => (
              <span
                key={skill}
                className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-sm font-medium border border-primary/20"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>

        {/* City Comparison */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">City-wise Salary Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border dark:border-border-dark">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted">City</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-muted">Junior</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-muted">Mid-Level</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-muted">Senior</th>
                </tr>
              </thead>
              <tbody>
                {role.cityComparison.map((city) => (
                  <tr
                    key={city.city}
                    className="border-b border-border/50 dark:border-border-dark/50 hover:bg-primary/5 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium">{city.city}</td>
                    <td className="py-3 px-4 text-right text-sm">{formatSalary(city.junior)}</td>
                    <td className="py-3 px-4 text-right text-sm">{formatSalary(city.mid)}</td>
                    <td className="py-3 px-4 text-right text-sm font-medium text-primary">
                      {formatSalary(city.senior)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Career Roadmap */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Career Roadmap</h2>
          <div className="space-y-4">
            {role.roadmap.map((step, index) => (
              <div
                key={index}
                className="flex gap-4 p-4 rounded-xl border border-border dark:border-border-dark bg-card dark:bg-card-dark"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{step.step}</h3>
                  <p className="text-sm text-muted">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* AdSlot - Mid Content */}
        <div className="mb-12 mt-8">
          <AdSlot position="pre-footer" />
        </div>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {role.faqs.map((faq, index) => (
              <details
                key={index}
                className="group p-4 rounded-xl border border-border dark:border-border-dark bg-card dark:bg-card-dark"
              >
                <summary className="font-semibold cursor-pointer list-none flex items-center justify-between">
                  {faq.question}
                  <span className="text-primary transition-transform group-open:rotate-180">
                    ▼
                  </span>
                </summary>
                <p className="mt-3 text-muted leading-relaxed">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* B5: Submit Your Salary CTA */}
        <section className="mb-12 p-6 rounded-2xl border border-primary/20 bg-primary/5">
          <h2 className="text-xl font-bold mb-2">Know Your Salary? Help the Community.</h2>
          <p className="text-sm text-muted mb-4">
            Your anonymous submission helps thousands of Pakistani developers make better career decisions. Takes 2 minutes.
          </p>
          <Link
            href="/contact?subject=Salary+Data+Submission"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold rounded-xl text-sm hover:bg-primary-dark transition-all"
          >
            Submit My Salary →
          </Link>
        </section>

        {/* B3: Data disclaimer */}
        <p className="text-xs text-muted italic mb-8 p-4 border border-border dark:border-border-dark rounded-xl bg-surface dark:bg-surface-dark">
          ℹ️ All salary figures are estimates and may vary based on company, location, experience, negotiation skills, and market conditions. Use as a reference, not as guaranteed compensation.
        </p>

        {/* E3: Related Tools CTA */}
        <section className="mb-12 p-6 rounded-2xl border border-border dark:border-border-dark bg-card dark:bg-card-dark">
          <h2 className="text-lg font-bold mb-4">Useful Tools for {role.shortTitle}s</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/tools/salary-after-tax-calculator"
              className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border dark:border-border-dark hover:border-primary/50 hover:bg-primary/5 transition-all text-sm font-medium"
            >
              <span>🧮</span> Calculate Take-Home Pay →
            </Link>
            <Link
              href="/tools/salary-comparison-tool"
              className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border dark:border-border-dark hover:border-primary/50 hover:bg-primary/5 transition-all text-sm font-medium"
            >
              <span>📊</span> Compare Your Salary →
            </Link>
            <Link
              href="/tools/freelance-rate-calculator"
              className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border dark:border-border-dark hover:border-primary/50 hover:bg-primary/5 transition-all text-sm font-medium"
            >
              <span>💡</span> Freelance Rate Calculator →
            </Link>
          </div>
        </section>

        {/* Back link */}
        <div className="text-center">
          <Link
            href="/salaries"
            className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium transition-colors"
          >
            ← Back to all salary guides
          </Link>
        </div>
      </div>
    </>
  );
}
