import type { Metadata } from "next";
import CategoryJobsPage from "@/components/CategoryJobsPage";

export const metadata: Metadata = {
  title: "MERN Stack Jobs in Pakistan 2026 | PakTechJobs",
  description: "Find MERN stack developer jobs in Pakistan. MongoDB, Express, React, Node.js positions in Lahore, Karachi and remote.",
};

export default function Page() {
  return (
    <CategoryJobsPage
      title="MERN Stack Jobs in Pakistan — 2026"
      description="MongoDB, Express, React, Node.js positions from verified Pakistani companies."
      apiParams="q=MERN"
      seoHeading="MERN Stack Developer Jobs in Pakistan"
      seoText="PakTechJobs lists the latest MERN stack developer jobs in Pakistan. All positions are posted by real recruiters. Find MongoDB, Express, React, and Node.js roles in Lahore, Karachi, Islamabad and remote."
    />
  );
}
