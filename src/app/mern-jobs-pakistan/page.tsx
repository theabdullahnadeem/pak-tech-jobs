import JobCard from "@/components/JobCard";
import JobSearchBar from "@/components/JobSearchBar";
import AdSlot from "@/components/AdSlot";
import AffiliateCoursesWidget from "@/components/AffiliateCoursesWidget";
import { getJobsByCategory } from "@/data/jobs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MERN Stack Developer Jobs in Pakistan 2026 | PakTechJobs",
  description: "Apply to full-stack MERN (MongoDB, Express, React, Node) developer jobs across Pakistan. Earn competitive salaries today.",
};

export default function CategoryPage() {
  const jobs = getJobsByCategory("MERN");

  return (
    <div className="min-h-screen bg-background pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Hero */}
        <div className="bg-gradient-to-r from-primary/90 to-primary-dark rounded-3xl p-8 md:p-16 mb-12 text-white relative overflow-hidden">
          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              MERN Stack Developer Jobs in Pakistan — 2026
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-10">
              Browse current openings and get hired faster. Over 500+ top companies trust PakTechJobs for tech talent.
            </p>
            <JobSearchBar initialLocation="All Cities" initialKeyword="MERN" />
          </div>
        </div>

        {/* AdSlot - Post Intro */}
        <div className="mb-12">
          <AdSlot position="post-intro" />
        </div>

        {/* Job Grid & Filters Layout */}
        <div className="flex flex-col lg:flex-row gap-10">
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Latest Openings</h2>
              <span className="text-muted text-sm">{jobs.length} jobs found</span>
            </div>
            
            <div className="space-y-4">
              {jobs.length > 0 ? jobs.map((job) => (
                <JobCard key={job.id} {...job} />
              )) : (
                <div className="text-center py-20 border border-border dark:border-border-dark rounded-2xl bg-surface dark:bg-surface-dark">
                  <span className="text-4xl block mb-4">🕵️‍♂️</span>
                  <h3 className="text-xl font-bold mb-2">No jobs matched</h3>
                  <p className="text-muted">Try adjusting your search criteria or check back later.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        
        {/* Affiliate Courses Widget */}
        <div className="mt-16">
          <AffiliateCoursesWidget skill="MERN Stack" />
        </div>
        

        {/* AdSlot - Pre Footer */}
        <div className="mt-20">
          <AdSlot position="pre-footer" />
        </div>

        {/* SEO Paragraph */}
        <div className="mt-16 bg-surface dark:bg-surface-dark p-8 rounded-2xl border border-border dark:border-border-dark text-sm text-muted">
          <h2 className="text-lg font-bold text-foreground mb-3">About MERN Stack Developer Jobs in Pakistan</h2>
          <p>
            Welcome to the premier portal for finding <strong>MERN Stack Developer Jobs in Pakistan 2026 | PakTechJobs</strong>. 
            The tech industry is rapidly growing, and securing the right role requires staying updated with the most recent listings. 
            Whether you are looking to work locally on-site or want to break into the international market with remote opportunities, 
            we aggregate the best positions from top companies. Use our search tools to filter by experience, salary, and tech stack. 
            Keep returning as we update our job board daily with the finest opportunities tailored for Pakistani developers and engineers.
          </p>
        </div>

      </div>
    </div>
  );
}
