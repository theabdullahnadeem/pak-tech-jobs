import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Software Engineer Salary in Pakistan 2026 — Tech Salaries, Career Tools & Free Calculators | PakTechSalary",
    template: "%s | PakTechSalary",
  },
  description:
    "Discover software engineer salary in Pakistan, cyber security salary, MERN developer salary Lahore, Karachi & Islamabad. Free salary after tax calculator, freelance rate calculator, developer salary comparison tool & AI resume checker for Pakistan's tech industry.",
  keywords: [
    "software engineer salary in pakistan",
    "salary of software engineer in pakistan",
    "software engineering salary in pakistan",
    "cyber security salary in pakistan",
    "cyber security salary",
    "mern developer salary pakistan",
    "mern developer salary lahore",
    "react developer salary pakistan",
    "frontend developer salary pakistan",
    "backend developer salary karachi",
    "full stack developer salary pakistan",
    "ai engineer salary pakistan",
    "data scientist salary pakistan",
    "machine learning engineer salary pakistan",
    "software engineer scope in pakistan",
    "highest paying tech jobs in pakistan",
    "developer salary calculator pakistan",
    "income tax calculator pakistan salary",
    "freelance rate calculator pakistan",
    "salary after tax pakistan",
    "fresh graduate software engineer salary pakistan",
    "senior software engineer salary in pakistan",
    "computer engineer salary in pakistan",
    "node js developer salary pakistan",
    "software engineering internship salary pakistan",
    "internship stipend pakistan",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "PakTechSalary",
    title: "Software Engineer Salary in Pakistan 2026 — PakTechSalary",
    description:
      "Complete salary guides for software engineers, MERN developers, cyber security experts, AI engineers & more across Lahore, Karachi & Islamabad. Free career tools included.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Software Engineer Salary in Pakistan 2026 — PakTechSalary",
    description:
      "Software engineer salary Pakistan, cyber security salary, developer salaries Lahore, Karachi & Islamabad. Free calculators & AI resume checker.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar />
        <main className="min-h-screen pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
