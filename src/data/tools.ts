export interface Tool {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  icon: string;
  seoContent: string;
}

export const tools: Tool[] = [
  {
    slug: "salary-after-tax-calculator",
    title: "Income Tax Calculator Pakistan — Salary After Tax 2025-26",
    shortTitle: "Salary After Tax",
    description: "Income tax calculator Pakistan for salaried employees. Calculate salary after tax Pakistan using latest FBR tax slabs 2025-26. See your net take-home pay instantly.",
    icon: "💰",
    seoContent: "Understanding your net salary after tax deductions is essential for financial planning in Pakistan. Our income tax calculator Pakistan uses the latest Federal Board of Revenue (FBR) tax slabs for fiscal year 2025-26 to calculate your salary after tax Pakistan. Whether you're a salaried software engineer, freelancer, or contractor, knowing your effective tax rate helps you budget and plan your career moves.",
  },
  {
    slug: "salary-comparison-tool",
    title: "Developer Salary Calculator Pakistan — Compare Tech Salaries 2026",
    shortTitle: "Salary Comparison",
    description: "Developer salary calculator Pakistan. Compare software engineer salary, MERN developer salary, AI engineer salary & more across Lahore, Karachi & Islamabad.",
    icon: "📊",
    seoContent: "Looking for a developer salary calculator Pakistan? Compare software engineer salary, MERN developer salary, React developer salary, and AI engineer salary across different experience levels. Our salary comparison tool helps you make informed career decisions with real compensation data from Pakistan's tech industry across Lahore, Karachi, and Islamabad.",
  },
  {
    slug: "freelance-rate-calculator",
    title: "Freelance Rate Calculator Pakistan — Developer Hourly Rates 2026",
    shortTitle: "Freelance Rate",
    description: "Freelance rate calculator Pakistan. Calculate your ideal hourly rate for Upwork, Fiverr & freelance projects based on desired income, expenses & taxes.",
    icon: "🧮",
    seoContent: "Setting the right freelance rate is crucial for Pakistani developers working on platforms like Upwork, Fiverr, and Toptal. Our freelance rate calculator Pakistan helps you determine competitive hourly and project-based rates by factoring in your desired monthly income, business expenses, taxes, and profit margins. Whether you're a software engineer or MERN developer, stop undervaluing your work.",
  },
  {
    slug: "resume-strength-checker",
    title: "Tech Resume Strength Checker",
    shortTitle: "Resume Checker",
    description: "Analyze your resume for key sections, action verbs, keywords, and formatting to score its effectiveness for tech jobs.",
    icon: "📝",
    seoContent: "Your resume is your first impression on potential employers. Our resume strength checker analyzes your resume content for essential elements that tech recruiters look for — including relevant keywords, action verbs, proper sections, quantified achievements, and optimal length. Get actionable suggestions to improve your resume and increase your chances of landing interviews at top tech companies in Pakistan.",
  },
];

export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find((tool) => tool.slug === slug);
}
