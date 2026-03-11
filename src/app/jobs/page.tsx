import JobCard from "@/components/JobCard";
import JobSearchBar from "@/components/JobSearchBar";
import AdSlot from "@/components/AdSlot";
import NewsletterSignup from "@/components/NewsletterSignup";
import ResumeReviewCTA from "@/components/ResumeReviewCTA";
import { jobsData } from "@/data/jobs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Tech Jobs in Pakistan | PakTechJobs",
  description: "Browse hundreds of software engineering, AI, and IT jobs in Pakistan updated daily. Remote, Lahore, Karachi, and Islamabad openings.",
};

export default function AllJobsPage() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Hero */}
        <div className="bg-gradient-to-r from-emerald-950 to-cyan-950 rounded-3xl p-8 md:p-16 mb-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]" />
          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              Tech Jobs in Pakistan
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-10">
              Find your next role as a software engineer, product designer, or data scientist. Discover remote and local opportunities across Pakistan.
            </p>
            <JobSearchBar />
          </div>
        </div>

        {/* AdSlot - Post Intro */}
        <div className="mb-12">
          <AdSlot position="post-intro" />
        </div>

        {/* Job Grid & Filters Layout */}
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Main Job Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Latest Openings</h2>
              <span className="text-muted text-sm">{jobsData.length} jobs found</span>
            </div>
            
            <div className="space-y-4">
              {jobsData.map((job) => (
                <JobCard key={job.id} {...job} />
              ))}
            </div>

            {/* Pagination Placeholder */}
            <div className="mt-12 flex justify-center">
               <button className="px-6 py-3 border border-border dark:border-border-dark rounded-xl font-medium hover:bg-surface dark:hover:bg-surface-dark transition-colors">
                  Load More Jobs
               </button>
            </div>
          </div>

        </div>

        {/* AdSlot - Pre Footer */}
        <div className="mt-20">
          <AdSlot position="pre-footer" />
        </div>

        {/* SEO Paragraph */}
        <div className="mt-16 bg-surface dark:bg-surface-dark p-8 rounded-2xl border border-border dark:border-border-dark text-sm text-muted">
          <h2 className="text-lg font-bold text-foreground mb-3">About Tech Jobs in Pakistan</h2>
          <p>
            Whether you are a seasoned professional or a fresh graduate looking for <strong>internships in Pakistan</strong>, our platform offers a comprehensive list of opportunities. The software engineering industry in Pakistan is booming, with extensive demand for React, Node.js, MERN stack, and Artificial Intelligence developers. Looking for flexibility? You can also explore our dedicated sections for <a href="/remote-jobs" className="text-primary hover:underline">Remote only jobs</a> to work with global companies from the comfort of your home in Lahore, Karachi, or Islamabad. Discover the best career growth opportunities tailored for Pakistani developers at PakTechJobs.
          </p>
        </div>

        {/* Resume Review CTA */}
        <div className="mt-16">
          <ResumeReviewCTA />
        </div>

      </div>

      {/* Newsletter Signup (Edge to Edge) */}
      <div className="mt-20 -mx-4 sm:-mx-6 lg:-mx-8 -mb-20">
        <NewsletterSignup />
      </div>

    </div>
  );
}
