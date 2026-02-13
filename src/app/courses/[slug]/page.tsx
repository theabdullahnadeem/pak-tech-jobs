import { courses, getCourseBySlug } from "@/data/courses";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return courses.map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course) return { title: "Course Not Found" };

  return {
    title: `${course.title} | Enroll Now`,
    description: course.description,
    openGraph: {
      title: course.title,
      description: course.description,
      type: "article",
    },
  };
}

export default async function CoursePage({ params }: PageProps) {
  const { slug } = await params;
  const course = getCourseBySlug(slug);

  if (!course) {
    notFound();
  }

  // Simple markdown renderer
  const renderContent = (content: string) => {
    const lines = content.trim().split("\n");
    const elements: React.ReactNode[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith("## ")) {
        elements.push(
          <h2 key={i} className="text-2xl font-bold mt-10 mb-4">
            {line.replace("## ", "")}
          </h2>
        );
      } else if (line.startsWith("### ")) {
        elements.push(
          <h3 key={i} className="text-lg font-semibold mt-6 mb-3 text-primary">
            {line.replace("### ", "")}
          </h3>
        );
      } else if (line.startsWith("- ")) {
        elements.push(
          <li key={i} className="ml-5 mb-1.5 text-muted list-disc text-sm leading-relaxed">
            {line.replace("- ", "")}
          </li>
        );
      } else if (line.trim() === "") {
        // skip blank lines
      } else {
        elements.push(
          <p key={i} className="text-muted leading-relaxed mb-3">
            {line}
          </p>
        );
      }
    }
    return elements;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Breadcrumb */}
      <nav className="mb-8 text-sm text-muted">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/courses" className="hover:text-primary transition-colors">Courses</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{course.shortTitle}</span>
      </nav>

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">{course.icon}</span>
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
            {course.category}
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">{course.title}</h1>
        <p className="text-lg text-muted mb-6">{course.description}</p>

        {/* Meta Row */}
        <div className="flex flex-wrap gap-4 text-sm text-muted">
          <span className="flex items-center gap-1.5">📚 {course.difficulty}</span>
          <span className="flex items-center gap-1.5">⏱️ {course.duration}</span>
          <span className="flex items-center gap-1.5">🛠️ {course.skills.length} skills covered</span>
        </div>
      </div>

      {/* Skills Tags */}
      <div className="mb-8">
        <h3 className="font-semibold mb-3">Skills You&apos;ll Learn</h3>
        <div className="flex flex-wrap gap-2">
          {course.skills.map((skill) => (
            <span
              key={skill}
              className="px-3 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Why Learn This */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 mb-8">
        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
          <span>💡</span> Why Learn This?
        </h3>
        <p className="text-muted leading-relaxed">{course.whyLearn}</p>
      </div>

      {/* ===== ENROLL NOW — 3 LINKS ===== */}
      <div className="mb-10 p-6 sm:p-8 rounded-2xl border border-border dark:border-border-dark bg-card dark:bg-card-dark">
        <h2 className="text-xl font-bold mb-2 text-center">Enroll Now</h2>
        <p className="text-sm text-muted text-center mb-6">
          Choose your preferred learning platform — or get personalized in-person training.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Coursera */}
          <a
            href={course.courseraLink}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center p-5 rounded-xl border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-500/40 transition-all hover:-translate-y-1"
          >
            <span className="text-3xl mb-2">🎓</span>
            <span className="font-bold text-blue-600 dark:text-blue-400 group-hover:underline">Coursera</span>
            <span className="text-xs text-muted mt-1">University-backed courses</span>
          </a>

          {/* Udemy */}
          <a
            href={course.udemyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center p-5 rounded-xl border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 hover:border-purple-500/40 transition-all hover:-translate-y-1"
          >
            <span className="text-3xl mb-2">📺</span>
            <span className="font-bold text-purple-600 dark:text-purple-400 group-hover:underline">Udemy</span>
            <span className="text-xs text-muted mt-1">Affordable, self-paced</span>
          </a>

          {/* In-person (WhatsApp) */}
          <a
            href={course.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center p-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-all hover:-translate-y-1"
          >
            <span className="text-3xl mb-2">👨‍🏫</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 group-hover:underline">
              In-Person Training
            </span>
            <span className="text-xs text-muted mt-1">Contact us on WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Full Course Content */}
      <article className="mb-10">{renderContent(course.content)}</article>

      {/* Bottom CTA */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-primary/20 text-center">
        <h3 className="text-xl font-bold mb-3">Ready to Start Learning?</h3>
        <p className="text-muted text-sm mb-5">
          Pick a platform above, or reach out for personalized guidance.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={course.courseraLink}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all"
          >
            🎓 Coursera
          </a>
          <a
            href={course.udemyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all"
          >
            📺 Udemy
          </a>
          <a
            href={course.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all"
          >
            💬 WhatsApp (In-Person)
          </a>
        </div>
      </div>

      {/* Back */}
      <div className="text-center pt-8 mt-8 border-t border-border dark:border-border-dark">
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium transition-colors"
        >
          ← Back to all courses
        </Link>
      </div>
    </div>
  );
}
