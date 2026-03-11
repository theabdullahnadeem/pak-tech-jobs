import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Career Tools for Pakistan Developers",
  description:
    "Free salary after tax calculator, freelance rate calculator, salary comparison tool & AI resume checker for Pakistan developers. No sign-up required.",
  openGraph: {
    title: "Free Career Tools for Pakistan Developers",
    description:
      "Free salary after tax calculator, freelance rate calculator, salary comparison tool & AI resume checker — no sign-up required.",
  },
};

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
