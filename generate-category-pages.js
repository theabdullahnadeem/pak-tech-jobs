const fs = require('fs');
const path = require('path');

const pages = [
  {
    path: "remote-jobs",
    title: "Remote Developer Jobs in Pakistan",
    keyword: "Remote",
    seoTitle: "Remote Developer Jobs in Pakistan 2026 | PakTechJobs",
    seoDesc: "Find the best remote software engineering, IT, and tech jobs for Pakistani developers. Work from home with top global companies.",
    isSkill: false
  },
  {
    path: "jobs-in-lahore",
    title: "Tech Events & Software Developer Jobs in Lahore",
    keyword: "Lahore",
    seoTitle: "Tech Jobs in Lahore 2026 - Software Houses Hiring | PakTechJobs",
    seoDesc: "Browse the latest IT and software engineering jobs in Lahore. Top software houses are actively hiring developers, ML engineers, and designers.",
    isSkill: false
  },
  {
    path: "jobs-in-karachi",
    title: "IT Jobs & Software Developer Roles in Karachi",
    keyword: "Karachi",
    seoTitle: "Tech & IT Jobs in Karachi 2026 | PakTechJobs",
    seoDesc: "Looking for an IT job in Karachi? Discover openings for React, MERN, Python, and Software Engineers across top tech companies in Karachi.",
    isSkill: false
  },
  {
    path: "jobs-in-islamabad",
    title: "Software Engineering Jobs in Islamabad",
    keyword: "Islamabad",
    seoTitle: "Software Developer Jobs in Islamabad 2026 | PakTechJobs",
    seoDesc: "Find your next tech role in the capital. View jobs in Islamabad for software engineers, frontend, backend, and full-stack developers.",
    isSkill: false
  },
  {
    path: "frontend-jobs",
    title: "Frontend Developer Jobs in Pakistan",
    keyword: "React",
    seoTitle: "Frontend Developer Jobs in Pakistan (React, Vue, Angular) | PakTechJobs",
    seoDesc: "Explore top frontend developer jobs in Pakistan. Master your UI skills with React, Vue, or Angular and get hired remotely or on-site.",
    isSkill: true,
    skillName: "Frontend Development"
  },
  {
    path: "backend-jobs",
    title: "Backend Engineer Jobs in Pakistan",
    keyword: "Node.js",
    seoTitle: "Backend Developer Jobs in Pakistan 2026 | PakTechJobs",
    seoDesc: "Backend engineering roles for Node.js, Python, Java, and Go developers in Pakistan. Find scalable server-side opportunities today.",
    isSkill: true,
    skillName: "Backend Engineering"
  },
  {
    path: "react-jobs-pakistan",
    title: "React.js Developer Jobs in Pakistan",
    keyword: "React",
    seoTitle: "React.js Developer Jobs in Pakistan 2026 | PakTechJobs",
    seoDesc: "Discover high-paying React.js developer jobs in Pakistan. Opportunities for Next.js, Redux, and React Native specialists.",
    isSkill: true,
    skillName: "React"
  },
  {
    path: "nodejs-jobs-pakistan",
    title: "Node.js Developer Jobs in Pakistan",
    keyword: "Node.js",
    seoTitle: "Node.js Developer Jobs in Pakistan 2026 | PakTechJobs",
    seoDesc: "Find Express and Node.js backend developer jobs in Lahore, Karachi, Islamabad, and remote. Build robust APIs for global companies.",
    isSkill: true,
    skillName: "Node.js"
  },
  {
    path: "mern-jobs-pakistan",
    title: "MERN Stack Developer Jobs in Pakistan",
    keyword: "MERN",
    seoTitle: "MERN Stack Developer Jobs in Pakistan 2026 | PakTechJobs",
    seoDesc: "Apply to full-stack MERN (MongoDB, Express, React, Node) developer jobs across Pakistan. Earn competitive salaries today.",
    isSkill: true,
    skillName: "MERN Stack"
  },
  {
    path: "ai-jobs-pakistan",
    title: "AI & Machine Learning Jobs in Pakistan",
    keyword: "Python",
    seoTitle: "AI & Machine Learning Engineer Jobs Pakistan 2026 | PakTechJobs",
    seoDesc: "Secure a highly sought-after AI and Machine Learning engineering position in Pakistan. Top roles in NLP, Computer Vision, and Generative AI.",
    isSkill: true,
    skillName: "Artificial Intelligence"
  },
  {
    path: "devops-jobs-pakistan",
    title: "DevOps Engineer Jobs in Pakistan",
    keyword: "DevOps",
    seoTitle: "DevOps & Cloud Engineer Jobs Pakistan 2026 | PakTechJobs",
    seoDesc: "Deploy, scale, and manage infrastructure. Browse DevOps jobs for AWS, Kubernetes, Docker, and CI/CD specialists in Pakistan.",
    isSkill: true,
    skillName: "DevOps & Cloud"
  },
  {
    path: "internships-pakistan",
    title: "IT & Software Engineering Internships in Pakistan",
    keyword: "Intern",
    seoTitle: "IT Internships & Fresh Graduate Trainee Programs | PakTechJobs",
    seoDesc: "Kickstart your tech career. Explore paid software engineering, IT, and developer internships in Lahore, Karachi, and Islamabad.",
    isSkill: false
  },
  {
    path: "fresh-graduate-it-jobs",
    title: "Entry Level & Fresh Graduate IT Jobs Pakistan",
    keyword: "Intern",
    seoTitle: "Fresh Graduate IT Jobs in Pakistan 2026 | PakTechJobs",
    seoDesc: "Just graduated? Find entry-level software engineering and IT jobs specifically looking for fresh graduates in Pakistan.",
    isSkill: false
  }
];

const template = (page) => `import JobCard from "@/components/JobCard";
import JobSearchBar from "@/components/JobSearchBar";
import AdSlot from "@/components/AdSlot";
${page.isSkill ? 'import AffiliateCoursesWidget from "@/components/AffiliateCoursesWidget";' : ''}
import { getJobsByCategory } from "@/data/jobs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "${page.seoTitle}",
  description: "${page.seoDesc}",
};

export default function CategoryPage() {
  const jobs = getJobsByCategory("${page.keyword}");

  return (
    <div className="min-h-screen bg-background pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Hero */}
        <div className="bg-gradient-to-r from-primary/90 to-primary-dark rounded-3xl p-8 md:p-16 mb-12 text-white relative overflow-hidden">
          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              ${page.title} — 2026
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-10">
              Browse current openings and get hired faster. Over 500+ top companies trust PakTechJobs for tech talent.
            </p>
            <JobSearchBar initialLocation="${page.keyword === "Lahore" || page.keyword === "Karachi" || page.keyword === "Islamabad" || page.keyword === "Remote" ? page.keyword : "All Cities"}" ${page.isSkill ? `initialKeyword="${page.keyword}"` : ''} />
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

        ${page.isSkill ? `
        {/* Affiliate Courses Widget */}
        <div className="mt-16">
          <AffiliateCoursesWidget skill="${page.skillName}" />
        </div>
        ` : ''}

        {/* AdSlot - Pre Footer */}
        <div className="mt-20">
          <AdSlot position="pre-footer" />
        </div>

        {/* SEO Paragraph */}
        <div className="mt-16 bg-surface dark:bg-surface-dark p-8 rounded-2xl border border-border dark:border-border-dark text-sm text-muted">
          <h2 className="text-lg font-bold text-foreground mb-3">About ${page.title}</h2>
          <p>
            Welcome to the premier portal for finding <strong>${page.seoTitle}</strong>. 
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
`;

try {
  pages.forEach((page) => {
    const dirPath = path.join(process.cwd(), 'src/app', page.path);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    fs.writeFileSync(path.join(dirPath, 'page.tsx'), template(page));
  });
  console.log("SUCCESS");
} catch (e) {
  console.error(e);
}
