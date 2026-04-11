import type { Metadata } from "next";
import CategoryJobsPage from "@/components/CategoryJobsPage";

export const metadata: Metadata = {
  title: "Node.js Developer Jobs in Pakistan 2026 | PakTechJobs",
  description: "Find Node.js backend developer jobs in Pakistan. Browse positions in Lahore, Karachi, Islamabad and remote.",
};

export default function Page() {
  return (
    <CategoryJobsPage
      title="Node.js Developer Jobs in Pakistan — 2026"
      description="Backend and full-stack Node.js positions from verified Pakistani recruiters."
      apiParams="q=Node.js"
      seoHeading="Node.js Developer Jobs in Pakistan"
      seoText="Browse the latest Node.js developer jobs in Pakistan on PakTechJobs. All listings are real jobs posted by verified recruiters. Find backend and full-stack Node.js roles across Lahore, Karachi, Islamabad and remote."
    />
  );
}
