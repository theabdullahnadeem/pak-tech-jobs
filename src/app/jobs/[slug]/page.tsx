import { notFound } from "next/navigation";
import { getJobBySlug, getJobsByCategory } from "@/data/jobs";
import JobCard from "@/components/JobCard";
import AdSlot from "@/components/AdSlot";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const job = getJobBySlug(resolvedParams.slug);

  if (!job) {
    return { title: "Job Not Found | PakTechJobs" };
  }

  return {
    title: `${job.title} at ${job.company} | PakTechJobs`,
    description: `Apply for the ${job.title} position at ${job.company} in ${job.location}. ${job.experience} required.`,
  };
}

export default async function JobDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const job = getJobBySlug(resolvedParams.slug);

  if (!job) {
    notFound();
  }

  // Find related jobs based on the first skill, excluding current job
  const relatedSearchTerm = job.skills[0] || "react";
  const relatedJobs = getJobsByCategory(relatedSearchTerm)
    .filter((j) => j.id !== job.id)
    .slice(0, 3); // Get top 3

  const isRemote = job.location.toLowerCase().includes("remote");

  // Generate JSON-LD JobPosting schema
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description,
    "hiringOrganization": {
      "@type": "Organization",
      "name": job.company,
      "logo": job.logoUrl || "https://paktechjobs.com/icon.png"
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": isRemote ? "Remote" : job.location,
        "addressCountry": "PK"
      }
    },
    "employmentType": job.type.toUpperCase().replace("-", "_"),
    "datePosted": new Date().toISOString().split("T")[0],
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      {/* Inject JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Main Content (70%) */}
          <div className="lg:w-2/3">
            {/* Header Card */}
            <div className="bg-card dark:bg-card-dark rounded-3xl p-8 border border-border dark:border-border-dark mb-8">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-20 h-20 rounded-2xl border border-border bg-surface flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {job.logoUrl ? (
                    <img src={job.logoUrl} alt={job.company} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-muted">{job.company.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-foreground">{job.title}</h1>
                  <p className="text-lg text-muted-foreground">{job.company}</p>
                </div>
              </div>

              {/* Badges Flow */}
              <div className="flex flex-wrap items-center gap-3 mb-8">
                <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                  job.type === "Full-time" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" :
                  job.type === "Contract" ? "bg-purple-500/10 text-purple-600 dark:text-purple-400" :
                  "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                }`}>
                  {job.type}
                </span>
                <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${isRemote ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-surface text-foreground border border-border"}`}>
                  {isRemote ? "🌍 Remote" : `📍 ${job.location}`}
                </span>
                {job.salary && (
                  <span className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-primary/10 text-primary">
                    💰 {job.salary}
                  </span>
                )}
                <span className="px-3 py-1.5 rounded-lg text-sm font-medium bg-surface text-muted-foreground border border-border">
                  ⏳ Exp: {job.experience}
                </span>
              </div>

              {job.applyUrl ? (
                <a 
                  href={job.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-3.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-colors text-lg"
                >
                  Apply Externally 🚀
                </a>
              ) : (
                <button disabled className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-3.5 bg-muted text-muted-foreground font-bold rounded-xl text-lg cursor-not-allowed">
                  Apply Closed
                </button>
              )}
            </div>
            
            <AdSlot position="job-detail-post-header" />

            {/* Description Card */}
            <div className="bg-card dark:bg-card-dark rounded-3xl p-8 border border-border dark:border-border-dark mb-8">
              <h2 className="text-2xl font-bold mb-6">Job Description</h2>
              <div className="prose dark:prose-invert max-w-none text-muted-foreground mb-8 text-lg leading-relaxed">
                <p>{job.description}</p>
              </div>

              <h2 className="text-2xl font-bold mb-6">Requirements</h2>
              <ul className="space-y-3 mb-8 text-lg text-muted-foreground">
                {job.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-primary mt-1">✔</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>

              <h2 className="text-2xl font-bold mb-6">Technologies & Skills</h2>
              <div className="flex flex-wrap gap-3">
                {job.skills.map((skill) => (
                  <span key={skill} className="px-4 py-2 rounded-xl bg-surface border border-border text-foreground font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <AdSlot position="job-detail-pre-footer" />
            
            <div className="bg-surface dark:bg-surface-dark p-6 rounded-2xl border border-border flex items-center justify-between mt-8">
              <div>
                <p className="font-semibold text-lg mb-1">Ready to join {job.company}?</p>
                <p className="text-sm text-muted">Posted {job.datePosted}</p>
              </div>
              {job.applyUrl && (
                <a 
                  href={job.applyUrl} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-foreground text-background font-bold rounded-xl hover:opacity-90 transition-opacity"
                >
                  Apply Externally
                </a>
              )}
            </div>

          </div>

          {/* Sidebar (30%) */}
          <div className="lg:w-1/3 space-y-8">
            {/* Related Jobs Widget */}
            <div className="bg-card dark:bg-card-dark rounded-3xl p-6 border border-border dark:border-border-dark sticky top-24">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span>🔥</span> Related Jobs
              </h3>
              
              {relatedJobs.length > 0 ? (
                <div className="space-y-4">
                  {relatedJobs.map((rJob) => (
                    <JobCard key={rJob.id} {...rJob} />
                  ))}
                </div>
              ) : (
                <p className="text-muted text-sm text-center py-4">No related jobs found.</p>
              )}
              
              <div className="mt-6 pt-6 border-t border-border text-center">
                <a href="/jobs-in-lahore" className="text-primary font-medium hover:underline">
                  View all developer jobs →
                </a>
              </div>
            </div>

            <AdSlot position="job-detail-sidebar" />
          </div>

        </div>
      </div>
    </div>
  );
}
