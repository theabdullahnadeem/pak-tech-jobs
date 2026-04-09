"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface AIAnalysis {
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  overallReport: string;
}

// --- Basic local checks (kept as fallback/quick check) ---
const actionVerbs = [
  "achieved", "built", "created", "delivered", "developed", "designed",
  "implemented", "improved", "increased", "launched", "led", "managed",
  "optimized", "reduced", "resolved", "scaled", "streamlined", "spearheaded",
  "automated", "architected", "collaborated", "deployed", "engineered",
  "established", "executed", "facilitated", "generated", "integrated",
  "maintained", "mentored", "migrated", "negotiated", "orchestrated",
];

const techKeywords = [
  "javascript", "typescript", "python", "react", "node", "next.js", "vue",
  "angular", "mongodb", "sql", "postgresql", "aws", "docker", "kubernetes",
  "git", "github", "ci/cd", "api", "rest", "graphql", "html", "css",
  "tailwind", "agile", "scrum", "devops", "machine learning", "ai",
];

const essentialSections = [
  "experience", "education", "skills", "projects", "summary", "objective",
  "work history", "professional", "technical skills", "certifications",
];

interface QuickCheck {
  label: string;
  passed: boolean;
  suggestion: string;
}

function quickAnalyze(text: string): QuickCheck[] {
  const lowerText = text.toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);
  const lines = text.split("\n").filter((l) => l.trim());
  const checks: QuickCheck[] = [];

  const goodLength = words.length >= 200 && words.length <= 1000;
  checks.push({
    label: `Resume length: ${words.length} words`,
    passed: goodLength,
    suggestion: words.length < 200
      ? "Too short — aim for 200–1000 words."
      : words.length > 1000
      ? "Too long — keep it concise."
      : "Great length!",
  });

  const hasEmail = /[\w.-]+@[\w.-]+\.\w+/.test(text);
  const hasPhone = /(\+?\d[\d\s-]{7,})/.test(text);
  const hasLinkedIn = /linkedin/i.test(text);
  checks.push({
    label: `Contact info (${[hasEmail, hasPhone, hasLinkedIn].filter(Boolean).length}/3)`,
    passed: [hasEmail, hasPhone, hasLinkedIn].filter(Boolean).length >= 2,
    suggestion: "Include email, phone, and LinkedIn URL.",
  });

  const foundSections = essentialSections.filter((s) => lowerText.includes(s));
  checks.push({
    label: `Key sections: ${foundSections.length}`,
    passed: foundSections.length >= 3,
    suggestion: foundSections.length < 3 ? "Add Experience, Skills, Education, Projects." : "Good structure!",
  });

  const foundVerbs = actionVerbs.filter((v) => lowerText.includes(v));
  checks.push({
    label: `Action verbs: ${foundVerbs.length}`,
    passed: foundVerbs.length >= 5,
    suggestion: foundVerbs.length < 5 ? "Use more action verbs (built, implemented, led…)." : "Great use of action verbs!",
  });

  const foundKeywords = techKeywords.filter((k) => lowerText.includes(k));
  checks.push({
    label: `Tech keywords: ${foundKeywords.length}`,
    passed: foundKeywords.length >= 5,
    suggestion: foundKeywords.length < 5 ? "Add more relevant tech keywords for ATS." : "Good keyword density!",
  });

  const hasNumbers = (text.match(/\d+%|\d+x|\$\d+|\d+ (users|clients|projects|team|members)/gi) || []).length;
  checks.push({
    label: `Quantified achievements: ${hasNumbers}`,
    passed: hasNumbers >= 2,
    suggestion: hasNumbers < 2 ? "Add numbers: 'Improved performance by 40%'." : "Achievements are quantified!",
  });

  const hasGitHub = /github/i.test(text);
  const hasPortfolio = /portfolio|website|site/i.test(text);
  checks.push({
    label: "GitHub/Portfolio links",
    passed: hasGitHub || hasPortfolio,
    suggestion: !(hasGitHub || hasPortfolio) ? "Add GitHub/portfolio links." : "Online presence linked!",
  });

  checks.push({
    label: "Formatting",
    passed: !/[.]{3,}|[!]{2,}|[?]{2,}/.test(text) && lines.length > 5,
    suggestion: "Keep formatting clean and professional.",
  });

  return checks;
}

export default function ResumeStrengthChecker() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [resumeText, setResumeText] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [quickChecks, setQuickChecks] = useState<QuickCheck[] | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"quick" | "ai">("quick");

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    tl
      .fromTo(".resume-icon",
        { scale: 0, rotation: -180, opacity: 0 },
        { scale: 1, rotation: 0, opacity: 1, duration: 0.9, ease: "back.out(2)" }
      )
      .fromTo(".resume-heading",
        { y: 50, opacity: 0, clipPath: "inset(100% 0 0 0)" },
        { y: 0, opacity: 1, clipPath: "inset(0% 0 0 0)", duration: 0.9 },
        "-=0.4"
      )
      .fromTo(".resume-form",
        { y: 70, opacity: 0, scale: 0.93, rotateX: 10, transformPerspective: 900 },
        { y: 0, opacity: 1, scale: 1, rotateX: 0, duration: 0.9 },
        "-=0.4"
      );
  }, { scope: containerRef });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setResumeText(ev.target?.result as string || "");
      };
      reader.readAsText(file);
    } else if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      // For PDF, we'll read as text (basic extraction)
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const buffer = ev.target?.result as ArrayBuffer;
        // Basic PDF text extraction (look for text between parentheses in the PDF stream)
        const bytes = new Uint8Array(buffer);
        let text = "";
        const decoder = new TextDecoder("utf-8", { fatal: false });
        const rawText = decoder.decode(bytes);
        
        // Extract text between BT and ET markers, and parenthesized strings
        const textMatches = rawText.match(/\(([^)]+)\)/g);
        if (textMatches) {
          text = textMatches
            .map((m) => m.slice(1, -1))
            .filter((t) => t.length > 1 && !/^[\x00-\x1f]+$/.test(t))
            .join(" ");
        }

        if (text.trim().length < 50) {
          setResumeText("");
          setAiError(
            "Could not extract text from this PDF. Please copy and paste your resume text directly."
          );
        } else {
          setResumeText(text);
          setAiError(null);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setAiError("Please upload a .txt or .pdf file, or paste your resume text directly.");
    }
  };

  const handleQuickCheck = () => {
    if (resumeText.trim().length < 20) return;
    setQuickChecks(quickAnalyze(resumeText));
    setActiveTab("quick");
  };

  const handleAIAnalysis = async () => {
    if (resumeText.trim().length < 50) return;
    setAiLoading(true);
    setAiError(null);
    setAiAnalysis(null);
    setActiveTab("ai");

    try {
      const res = await fetch("/api/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAiError(data.error || "Something went wrong.");
        return;
      }

      setAiAnalysis(data);
    } catch {
      setAiError("Failed to connect to AI service. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const quickScore = quickChecks
    ? Math.round((quickChecks.filter((c) => c.passed).length / quickChecks.length) * 100)
    : 0;

  return (
    <div ref={containerRef} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <nav className="mb-8 text-sm text-muted">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/tools" className="hover:text-primary transition-colors">Tools</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Resume Strength Checker</span>
      </nav>

      <div className="resume-heading text-center">
        <div className="resume-icon text-5xl mb-4">📝</div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">
          AI Resume <span className="gradient-text">Strength Checker</span>
        </h1>
        <p className="text-muted text-lg mb-8">
          Upload your resume or paste the text — get instant analysis and AI-powered feedback in 4 key areas.
        </p>
      </div>

      {/* Input Section */}
      <div className="resume-form p-6 sm:p-8 rounded-2xl border border-border dark:border-border-dark bg-card dark:bg-card-dark mb-8">
        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Upload Resume (.txt or .pdf)</label>
          <div className="relative">
            <input
              type="file"
              accept=".txt,.pdf"
              onChange={handleFileUpload}
              className="hidden"
              id="resume-upload"
            />
            <label
              htmlFor="resume-upload"
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border-2 border-dashed border-border dark:border-border-dark bg-background text-muted cursor-pointer hover:border-primary/50 hover:text-foreground transition-all"
            >
              <span className="text-2xl">📎</span>
              <span className="text-sm">
                {fileName ? fileName : "Click to upload resume file…"}
              </span>
            </label>
          </div>
        </div>

        {/* Text Area */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Or paste your resume text
          </label>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste the full text of your resume here..."
            rows={10}
            className="w-full px-4 py-3 rounded-xl border border-border dark:border-border-dark bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-y font-mono text-sm"
          />
          <span className="text-xs text-muted mt-1 block">
            {resumeText.split(/\s+/).filter(Boolean).length} words
          </span>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleQuickCheck}
            disabled={resumeText.trim().length < 20}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ⚡ Quick Check
          </button>
          <button
            onClick={handleAIAnalysis}
            disabled={resumeText.trim().length < 50 || aiLoading}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {aiLoading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing with AI…
              </>
            ) : (
              <>🤖 AI Deep Analysis (Gemini)</>
            )}
          </button>
        </div>

        {aiError && (
          <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
            {aiError}
          </div>
        )}
      </div>

      {/* Results */}
      {(quickChecks || aiAnalysis) && (
        <div className="mb-8">
          {/* Tab Switcher */}
          <div className="flex gap-2 mb-6">
            {quickChecks && (
              <button
                onClick={() => setActiveTab("quick")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "quick"
                    ? "bg-blue-600 text-white"
                    : "bg-card dark:bg-card-dark text-muted border border-border dark:border-border-dark hover:text-foreground"
                }`}
              >
                ⚡ Quick Check
              </button>
            )}
            {aiAnalysis && (
              <button
                onClick={() => setActiveTab("ai")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "ai"
                    ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white"
                    : "bg-card dark:bg-card-dark text-muted border border-border dark:border-border-dark hover:text-foreground"
                }`}
              >
                🤖 AI Analysis
              </button>
            )}
          </div>

          {/* Quick Check Results */}
          {activeTab === "quick" && quickChecks && (
            <div className="space-y-6">
              {/* Score */}
              <div className="text-center p-6 rounded-2xl border border-border dark:border-border-dark bg-card dark:bg-card-dark">
                <div className={`text-5xl font-bold ${
                  quickScore >= 80 ? "text-emerald-500" : quickScore >= 60 ? "text-amber-500" : "text-red-500"
                }`}>
                  {quickScore}%
                </div>
                <div className="text-sm text-muted mt-1">
                  {quickChecks.filter((c) => c.passed).length} of {quickChecks.length} checks passed
                </div>
                <div className="w-full max-w-md mx-auto h-3 rounded-full bg-gray-100 dark:bg-gray-800 mt-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      quickScore >= 80
                        ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                        : quickScore >= 60
                        ? "bg-gradient-to-r from-amber-500 to-amber-400"
                        : "bg-gradient-to-r from-red-500 to-red-400"
                    }`}
                    style={{ width: `${quickScore}%` }}
                  />
                </div>
              </div>

              {/* Checks */}
              <div className="space-y-3">
                {quickChecks.map((check, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-xl border ${
                      check.passed
                        ? "bg-emerald-500/5 border-emerald-500/20"
                        : "bg-red-500/5 border-red-500/20"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span>{check.passed ? "✅" : "❌"}</span>
                      <span className="font-medium text-sm">{check.label}</span>
                    </div>
                    <p className="text-sm text-muted ml-7">{check.suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Analysis Results */}
          {activeTab === "ai" && aiAnalysis && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths */}
              <div className="p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <span className="text-2xl">💪</span> Strengths
                </h3>
                <ul className="space-y-2">
                  {aiAnalysis.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>
                      <span className="text-muted">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="p-6 rounded-2xl border border-red-500/30 bg-red-500/5">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <span className="text-2xl">⚠️</span> Weaknesses
                </h3>
                <ul className="space-y-2">
                  {aiAnalysis.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-red-500 mt-0.5 flex-shrink-0">✗</span>
                      <span className="text-muted">{w}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Improvements */}
              <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/5">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <span className="text-2xl">🔧</span> Improvements
                </h3>
                <ul className="space-y-2">
                  {aiAnalysis.improvements.map((imp, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-amber-500 mt-0.5 flex-shrink-0">→</span>
                      <span className="text-muted">{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Overall Report */}
              <div className="p-6 rounded-2xl border border-primary/30 bg-primary/5">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <span className="text-2xl">📊</span> Overall Report
                </h3>
                <p className="text-sm text-muted leading-relaxed">{aiAnalysis.overallReport}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SEO Content */}
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <h2 className="text-xl font-bold mb-3">About This Tool</h2>
        <p className="text-muted leading-relaxed">
          Your resume is your first impression on potential employers. Our AI-powered resume strength checker uses Google Gemini to analyze your resume content for essential elements that tech recruiters look for — including relevant keywords, action verbs, proper sections, quantified achievements, and optimal length. Get actionable suggestions across 4 key areas: strengths, weaknesses, improvements, and an overall report to increase your chances of landing interviews at top tech companies in Pakistan.
        </p>
      </div>
    </div>
  );
}
