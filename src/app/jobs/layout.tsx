import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tech Jobs in Pakistan — Remote, Lahore, Karachi & Islamabad",
  description:
    "Browse hundreds of software engineering, AI, and IT jobs in Pakistan updated daily. Remote, Lahore, Karachi, and Islamabad openings for all levels.",
  openGraph: {
    title: "Tech Jobs in Pakistan — Remote, Lahore, Karachi & Islamabad",
    description: "Browse hundreds of software engineering, AI, and IT jobs in Pakistan updated daily.",
  },
};

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
