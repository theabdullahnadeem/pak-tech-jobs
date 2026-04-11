import type { Metadata } from "next";
import CategoryJobsPage from "@/components/CategoryJobsPage";

export const metadata: Metadata = {
  title: "Tech Internships in Pakistan 2026 | PakTechJobs",
  description: "Find software engineering and IT internships in Pakistan. Browse internship opportunities for students and fresh graduates.",
};

export default function Page() {
  return (
    <CategoryJobsPage
      title="Tech Internships in Pakistan — 2026"
      description="Software engineering and IT internships posted by verified Pakistani companies."
      apiParams="jobType=INTERNSHIP"
      seoHeading="Tech Internships in Pakistan"
      seoText="PakTechJobs lists the latest software engineering and IT internships in Pakistan. All listings are posted by real companies. Find paid and unpaid internships in Lahore, Karachi, Islamabad and remote."
    />
  );
}
