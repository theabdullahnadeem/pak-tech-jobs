"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import NotificationBell from "./NotificationBell";
import { ThemeToggle } from "./ThemeToggle";

const navLinks = [
  { href: "/salaries", label: "Salaries" },
  { href: "/tools", label: "Tools" },
  { href: "/resources", label: "Resources" },
  { href: "/courses", label: "Courses" },
];

function getDashboardHref(role?: string) {
  if (role === "RECRUITER") return "/recruiter/dashboard";
  if (role === "ADMIN") return "/admin";
  return "/dashboard";
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [jobsDropdownOpen, setJobsDropdownOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl">🚀</span>
            <span className="font-bold text-lg gradient-text group-hover:opacity-80 transition-opacity">
              PakTechJobs
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {/* Jobs Dropdown */}
            <div 
              className="relative group"
              onMouseEnter={() => setJobsDropdownOpen(true)}
              onMouseLeave={() => setJobsDropdownOpen(false)}
            >
              <button className="px-4 py-2 rounded-lg text-sm font-medium text-foreground hover:text-foreground hover:bg-primary/10 transition-all duration-200 flex items-center gap-1">
                Jobs
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              
              {jobsDropdownOpen && (
                <div className="absolute bg-gray-900 left-0 mt-2 w-56 rounded-xl border border-border dark:border-border-dark shadow-xl py-2 z-50 animate-fade-in">
                  <Link href="/jobs" className="block px-4 py-2 hover:bg-surface hover:text-emerald-800 text-sm font-medium">All Jobs</Link>
                  <Link href="/remote-jobs" className="block px-4 py-2 hover:bg-surface hover:text-emerald-800 text-sm font-medium">Remote Jobs</Link>
                  <Link href="/jobs-in-lahore" className="block px-4 py-2 hover:bg-surface hover:text-emerald-800 text-sm font-medium">Jobs in Lahore</Link>
                  <Link href="/jobs-in-karachi" className="block px-4 py-2 hover:bg-surface hover:text-emerald-800 text-sm font-medium">Jobs in Karachi</Link>
                  <div className="border-t border-border my-1"></div>
                  <div className="px-4 py-1 text-xs text-muted uppercase tracking-wider font-bold">By Skill</div>
                  <Link href="/react-jobs-pakistan" className="block px-4 py-2 hover:bg-surface hover:text-emerald-800 text-sm font-medium">React Jobs</Link>
                  <Link href="/nodejs-jobs-pakistan" className="block px-4 py-2 hover:bg-surface hover:text-emerald-800 text-sm font-medium">Node.js Jobs</Link>
                  <Link href="/mern-jobs-pakistan" className="block px-4 py-2 hover:bg-surface hover:text-emerald-800 text-sm font-medium">MERN Stack</Link>
                  <Link href="/ai-jobs-pakistan" className="block px-4 py-2 hover:bg-surface hover:text-emerald-800 text-sm font-medium">AI & ML Jobs</Link>
                  <Link href="/devops-jobs-pakistan" className="block px-4 py-2 hover:bg-surface hover:text-emerald-800 text-sm font-medium">DevOps Jobs</Link>
                  <div className="border-t border-border my-1"></div>
                  <Link href="/internships-pakistan" className="block px-4 py-2 hover:bg-surface text-sm font-medium text-primary">Internships</Link>
                  <Link href="/fresh-graduate-it-jobs" className="block px-4 py-2 hover:bg-surface text-sm font-medium text-primary">Fresh Graduate</Link>
                </div>
              )}
            </div>

            {/* Legacy Links */}
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-lg text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-primary/10 transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth / Role-aware links + Notification Bell */}
          <div className="hidden md:flex items-center gap-1">
            {session?.user ? (
              <>
                <Link
                  href={getDashboardHref(session.user.role as string)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-primary/10 transition-all duration-200"
                >
                  Dashboard
                </Link>
                <ThemeToggle />
                <NotificationBell />
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-primary/10 transition-all duration-200"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <ThemeToggle />
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-primary/10 transition-all duration-200"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-all duration-200"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile: notification bell + hamburger */}
          <div className="flex items-center gap-1 md:hidden">
            <NotificationBell />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
              aria-label="Toggle menu"
            >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden glass border-t border-border dark:border-border-dark animate-fade-in max-h-[80vh] overflow-y-auto">
          <div className="px-4 py-4 space-y-4">
            
            <div>
              <div className="text-xs font-bold text-muted uppercase tracking-wider mb-2 px-4">Jobs Directory</div>
              <Link href="/jobs" onClick={() => setMobileOpen(false)} className="block px-4 py-2 rounded-lg text-sm font-medium hover:bg-surface">All Jobs</Link>
              <Link href="/remote-jobs" onClick={() => setMobileOpen(false)} className="block px-4 py-2 rounded-lg text-sm font-medium hover:bg-surface">Remote Jobs</Link>
              <Link href="/react-jobs-pakistan" onClick={() => setMobileOpen(false)} className="block px-4 py-2 rounded-lg text-sm font-medium hover:bg-surface">React Jobs</Link>
              <Link href="/internships-pakistan" onClick={() => setMobileOpen(false)} className="block px-4 py-2 rounded-lg text-sm font-medium text-primary hover:bg-surface">Internships</Link>
              <Link href="/fresh-graduate-it-jobs" onClick={() => setMobileOpen(false)} className="block px-4 py-2 rounded-lg text-sm font-medium text-primary hover:bg-surface">Fresh Graduate</Link>
            </div>

            <div className="pt-2 border-t border-border">
              <div className="text-xs font-bold text-muted uppercase tracking-wider mb-2 px-4 mt-2">Tools & Guides</div>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2 rounded-lg text-sm font-medium hover:bg-surface"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="pt-2 border-t border-border">
              <div className="flex items-center px-4 py-2 gap-2">
                <span className="text-xs text-muted">Theme</span>
                <ThemeToggle />
              </div>
              {session?.user ? (
                <>
                  <Link
                    href={getDashboardHref(session.user.role as string)}
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-2 rounded-lg text-sm font-medium hover:bg-surface"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => { setMobileOpen(false); signOut({ callbackUrl: "/" }); }}
                    className="block w-full text-left px-4 py-2 rounded-lg text-sm font-medium hover:bg-surface"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-2 rounded-lg text-sm font-medium hover:bg-surface">Sign in</Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)} className="block px-4 py-2 rounded-lg text-sm font-medium text-primary hover:bg-surface">Register</Link>
                </>
              )}
            </div>

          </div>
        </div>
      )}
    </nav>
  );
}
