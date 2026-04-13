import Link from "next/link";

const WA_MESSAGE = encodeURIComponent(
  "Hi! I'd like to get my resume reviewed by a Pakistani tech recruiter. Can you help me? (via PakTechJobs)"
);

export default function ResumeReviewCTA({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-3xl p-8 border border-border dark:border-border-dark bg-gradient-to-br from-indigo-900/10 to-purple-900/10 ${className}`}>
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex-1">
          <span className="inline-block px-3 py-1 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark text-xs font-bold uppercase tracking-wider text-muted rounded-full mb-3">
            Free Service
          </span>
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Get Your Resume Reviewed by a Pakistani Tech Recruiter
          </h3>
          <p className="text-muted text-lg mb-0 max-w-xl">
            Stand out to top software houses in Pakistan. We&apos;ll give you honest feedback on your CV — completely free via WhatsApp.
          </p>
        </div>
        <div className="shrink-0 w-full sm:w-auto text-center sm:text-right space-y-3">
          <a
            href={`https://wa.me/923161404891?text=${WA_MESSAGE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg transition-all hover:-translate-y-1 hover:shadow-emerald-500/30"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Get Free Review on WhatsApp
          </a>
          <p className="text-xs text-muted">
            Or email{" "}
            <a href="mailto:paktechhjobs@gmail.com" className="text-primary hover:underline">
              paktechhjobs@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
