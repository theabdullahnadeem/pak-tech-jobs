import type { Metadata } from "next";
import CategoryJobsPage from "@/components/CategoryJobsPage";

export const metadata: Metadata = {
  title: "AI & Machine Learning Jobs in Pakistan 2026 | PakTechJobs",
  description: "Find AI, ML, and data science jobs in Pakistan. Browse Python, TensorFlow, and machine learning positions.",
};

export default function Page() {
  return (
    <CategoryJobsPage
      title="AI & Machine Learning Jobs in Pakistan — 2026"
      description="Python, TensorFlow, and data science positions from verified Pakistani recruiters."
      apiParams="q=Python"
      seoHeading="AI & Machine Learning Jobs in Pakistan"
      seoText="Browse the latest AI, machine learning, and data science jobs in Pakistan on PakTechJobs. All listings are posted by real companies. Find Python, TensorFlow, PyTorch, and NLP roles across Pakistan."
    />
  );
}
