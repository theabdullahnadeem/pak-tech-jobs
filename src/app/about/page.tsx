import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About PakTechJobs — Pakistan's Tech Career Resource",
  description: "Learn about PakTechJobs — Pakistan's most detailed resource for tech salary guides, free career tools, and professional development for software engineers.",
  openGraph: {
    title: "About PakTechJobs — Pakistan's Tech Career Resource",
    description: "Free salary guides, career tools, and resources for tech professionals in Pakistan.",
  },
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
      <h1 className="text-3xl sm:text-4xl font-bold mb-3">
        About <span className="gradient-text">PakTechJobs</span>
      </h1>
      <p className="text-lg text-muted mb-10 max-w-2xl">
        Pakistan&apos;s most comprehensive resource for tech salary data, free career tools, and professional development.
      </p>

      <div className="space-y-10">
        {/* Mission */}
        <section>
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
            <span>🎯</span> Our Mission
          </h2>
          <p className="text-muted leading-relaxed">
            We believe every tech professional in Pakistan deserves access to transparent salary information and powerful career tools — completely free. PakTechJobs was created to bridge the information gap in Pakistan&apos;s rapidly growing tech industry, helping developers, engineers, designers, and other tech professionals make informed career decisions.
          </p>
        </section>

        {/* What We Offer */}
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>🚀</span> What We Offer
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                icon: "💰",
                title: "Salary Guides",
                desc: "Detailed salary breakdowns for 8+ tech roles across Pakistan, covering junior to senior levels and city-wise comparisons.",
              },
              {
                icon: "🛠️",
                title: "Career Tools",
                desc: "Free tools including a salary-after-tax calculator, salary comparison tool, freelance rate calculator, and AI-powered resume checker.",
              },
              {
                icon: "📚",
                title: "Resources",
                desc: "Expert career guides covering salary negotiation, remote work, freelancing, internships, and professional growth in Pakistan.",
              },
              {
                icon: "🎓",
                title: "Courses",
                desc: "Curated tech courses with links to Coursera, Udemy, and in-person training options for MERN, AI/ML, DevOps, and more.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-5 rounded-xl border border-border dark:border-border-dark bg-card dark:bg-card-dark"
              >
                <span className="text-2xl block mb-2">{item.icon}</span>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How We Gather Data */}
        <section>
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
            <span>📊</span> How We Gather Data
          </h2>
          <p className="text-muted leading-relaxed">
            Our salary data is compiled from multiple sources including publicly available job postings, industry surveys, crowd-sourced compensation reports, recruiter inputs, and direct feedback from tech professionals across Pakistan. We regularly update our figures to reflect the latest market trends.
          </p>
          <p className="text-muted leading-relaxed mt-3">
            <strong>Disclaimer:</strong> All salary figures are estimates and may vary based on company, location, experience, negotiation skills, and market conditions. They should be used as a reference, not as guaranteed compensation figures.
          </p>
        </section>

        {/* Technology */}
        <section>
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
            <span>⚡</span> Built With Modern Tech
          </h2>
          <p className="text-muted leading-relaxed mb-3">
            PakTechJobs is built with performance, accessibility, and user experience in mind:
          </p>
          <div className="flex flex-wrap gap-2">
            {["Next.js", "React", "TypeScript", "Tailwind CSS", "GSAP", "Google Gemini AI", "Vercel"].map((tech) => (
              <span
                key={tech}
                className="px-3 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full"
              >
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
            <span>📬</span> Get in Touch
          </h2>
          <p className="text-muted leading-relaxed mb-4">
            Have questions, feedback, or want to contribute salary data? We&apos;d love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/contact"
              className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all text-center"
            >
              Contact Us
            </Link>
            <a
              href="mailto:paktechjobs@gmail.com"
              className="px-6 py-3 border border-border dark:border-border-dark hover:border-primary/50 font-medium rounded-xl transition-all text-center"
            >
              paktechjobs@gmail.com
            </a>
          </div>
        </section>

        {/* B6: Founder Section */}
        <section className="border-t border-border dark:border-border-dark pt-10">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span>👤</span> Who Built This
          </h2>
          <div className="p-6 rounded-2xl border border-border dark:border-border-dark bg-card dark:bg-card-dark flex flex-col sm:flex-row gap-6 items-start">
            <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold">
              AN
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">Abdullah Nadeem</h3>
              <p className="text-sm text-primary font-medium mb-3">Founder, PakTechJobs</p>
              <p className="text-sm text-muted leading-relaxed mb-4">
                I built PakTechJobs because I saw how much confusion existed around tech salaries in Pakistan — developers were underpaid because they lacked data, and companies set ranges without market benchmarks. This platform is my attempt to fix that: free, transparent salary data and career tools for every tech professional in Pakistan.
              </p>
              <div className="flex gap-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary text-sm font-medium rounded-lg hover:bg-primary/20 transition-colors"
                >
                  Get in Touch
                </Link>
                <span className="text-xs text-muted self-center">
                  LinkedIn company page coming soon
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
