import Link from "next/link";

export default function ResumeReviewCTA({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-3xl p-8 border border-border dark:border-border-dark bg-gradient-to-br from-indigo-900/10 to-purple-900/10 ${className}`}>
      {/* Decorative background elements */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl" />
      
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex-1">
          <span className="inline-block px-3 py-1 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark text-xs font-bold uppercase tracking-wider text-muted-foreground rounded-full mb-3">
            Premium Service
          </span>
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Get Your Resume Reviewed by a Pakistani Tech Recruiter
          </h3>
          <p className="text-muted-foreground text-lg mb-0 max-w-xl">
            Stand out to top software houses in Pakistan. We'll optimize your CV for ATS scanners and highlight your strongest skills.
          </p>
        </div>
        <div className="flex-shrink-0 w-full sm:w-auto text-center sm:text-right">
          <Link
            href="/services/resume-review"
            className="inline-block w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg transition-all hover:-translate-y-1 hover:shadow-primary/30"
          >
            Book Review — $15
          </Link>
          <p className="text-xs text-muted mt-3">24-hour turnaround time</p>
        </div>
      </div>
    </div>
  );
}
