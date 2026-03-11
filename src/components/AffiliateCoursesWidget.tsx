"use client";

interface AffiliateCourse {
  platform: string;
  title: string;
  instructor: string;
  rating: number;
  price: string;
  url: string;
  imageUrl?: string;
}

interface AffiliateCoursesWidgetProps {
  skill: string;
  className?: string;
}

// Mock course generator for demonstration
const generateCoursesForSkill = (skill: string): AffiliateCourse[] => {
  return [
    {
      platform: "Udemy",
      title: `The Complete ${skill} Bootcamp 2026`,
      instructor: "Dr. Angela Yu",
      rating: 4.8,
      price: "$14.99",
      url: "#",
    },
    {
      platform: "Coursera",
      title: `Advanced ${skill} Specialization`,
      instructor: "Meta",
      rating: 4.9,
      price: "Included with Plus",
      url: "#",
    },
  ];
};

export default function AffiliateCoursesWidget({
  skill,
  className = "",
}: AffiliateCoursesWidgetProps) {
  const courses = generateCoursesForSkill(skill);

  return (
    <div className={`mt-16 pt-10 border-t border-border dark:border-border-dark ${className}`}>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h3 className="text-xl font-bold mb-2">
            Improve your chances — top courses for {skill}
          </h3>
          <p className="text-sm text-muted">
            Master {skill} with these highly-rated courses and stand out to employers.
          </p>
        </div>
        <span className="text-xs text-muted uppercase tracking-wider font-semibold px-2 py-1 bg-surface dark:bg-surface-dark rounded border border-border dark:border-border-dark">
          Sponsored
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course, i) => (
          <a
            key={i}
            href={course.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block p-5 rounded-xl border border-border dark:border-border-dark bg-card dark:bg-card-dark hover:border-primary/50 transition-all hover:shadow-xl"
          >
            <div className="flex items-center justify-between mb-3 text-sm">
              <span
                className={`font-bold ${
                  course.platform === "Udemy" ? "text-purple-600 dark:text-purple-400" : "text-blue-600 dark:text-blue-400"
                }`}
              >
                {course.platform}
              </span>
              <span className="flex items-center gap-1 text-amber-500 font-medium">
                ⭐ {course.rating}
              </span>
            </div>
            <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">
              {course.title}
            </h4>
            <div className="flex items-center justify-between text-sm mt-4">
              <span className="text-muted">{course.instructor}</span>
              <span className="font-bold text-foreground">{course.price}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
