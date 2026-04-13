/**
 * scripts/seed-jobs.ts
 *
 * Seeds 10 aggregated job listings under a system "PakTechJobs Aggregator" recruiter account.
 * These are real job categories with external apply links — not dummy data.
 * Run with: npx tsx scripts/seed-jobs.ts
 */

import { PrismaClient, JobType, ExperienceLevel, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const AGGREGATOR_EMAIL = "aggregator@paktechjobs.com";
const AGGREGATOR_NAME = "PakTechJobs";
const AGGREGATOR_COMPANY = "PakTechJobs Aggregated Listings";

const SEED_JOBS = [
  {
    title: "Full Stack Developer (MERN) — Remote",
    description:
      "Browse active MERN stack developer openings across Pakistan. Roles at software houses and fully remote positions for international clients.",
    skills: ["MongoDB", "Express.js", "React", "Node.js", "REST APIs", "Git"],
    location: "Remote, Pakistan",
    city: "Remote",
    salaryMin: 150000,
    salaryMax: 250000,
    experienceLevel: ExperienceLevel.MID,
    jobType: JobType.REMOTE,
    category: ["Full Stack", "MERN"],
    applyUrl: "https://pk.indeed.com/q-mern-stack-developer-jobs.html",
  },
  {
    title: "React Frontend Developer — Lahore",
    description:
      "Frontend React roles at Lahore software houses, working on SaaS platforms and client-facing web products.",
    skills: ["React.js", "JavaScript ES6+", "Redux", "HTML5", "CSS3", "REST APIs"],
    location: "Lahore (Hybrid)",
    city: "Lahore",
    salaryMin: 120000,
    salaryMax: 180000,
    experienceLevel: ExperienceLevel.JUNIOR,
    jobType: JobType.FULL_TIME,
    category: ["Frontend", "React"],
    applyUrl:
      "https://www.glassdoor.com/Job/lahore-mern-stack-developer-jobs-SRCH_IL.0,6_IC3206630_KO7,27.htm",
  },
  {
    title: "Python / AI Engineer — Islamabad or Remote",
    description:
      "AI and Python engineering roles in Islamabad and remote. LLM integration, ML model deployment, and data pipeline work.",
    skills: ["Python", "TensorFlow", "PyTorch", "LangChain", "Docker", "SQL", "REST APIs"],
    location: "Islamabad / Remote",
    city: "Islamabad",
    salaryMin: 200000,
    salaryMax: 350000,
    experienceLevel: ExperienceLevel.MID,
    jobType: JobType.REMOTE,
    category: ["AI", "Python", "Machine Learning"],
    applyUrl: "https://pk.indeed.com/q-artificial-intelligence-l-islamabad-jobs.html",
  },
  {
    title: "DevOps Engineer — Karachi",
    description:
      "DevOps and cloud engineering roles in Karachi. Infrastructure management, CI/CD pipelines, and container orchestration.",
    skills: ["AWS", "GCP", "Docker", "Kubernetes", "CI/CD", "Terraform", "Linux"],
    location: "Karachi (On-site / Hybrid)",
    city: "Karachi",
    salaryMin: 180000,
    salaryMax: 280000,
    experienceLevel: ExperienceLevel.MID,
    jobType: JobType.FULL_TIME,
    category: ["DevOps", "Cloud"],
    applyUrl: "https://pk.indeed.com/q-junior-aws-devops-jobs.html",
  },
  {
    title: "Mobile Developer (React Native) — Remote",
    description:
      "React Native developer openings building cross-platform mobile apps for global clients.",
    skills: ["React Native", "JavaScript", "iOS", "Android", "Firebase", "REST APIs"],
    location: "Rawalpindi / Remote",
    city: "Rawalpindi",
    salaryMin: 130000,
    salaryMax: 220000,
    experienceLevel: ExperienceLevel.MID,
    jobType: JobType.REMOTE,
    category: ["Mobile", "React Native"],
    applyUrl: "https://pk.indeed.com/q-remote-artificial-intelligence-jobs.html",
  },
  {
    title: "Backend Developer (Node.js) — Lahore",
    description:
      "Backend Node.js developer roles at Lahore software houses building scalable APIs for web and mobile platforms.",
    skills: ["Node.js", "Express.js", "PostgreSQL", "MongoDB", "Redis", "Docker"],
    location: "Lahore (Hybrid)",
    city: "Lahore",
    salaryMin: 140000,
    salaryMax: 210000,
    experienceLevel: ExperienceLevel.MID,
    jobType: JobType.FULL_TIME,
    category: ["Backend", "Node.js"],
    applyUrl:
      "https://www.glassdoor.com/Job/pakistan-node-jobs-SRCH_IL.0,8_IN192_KO9,13.htm",
  },
  {
    title: "UI/UX Designer — Karachi or Remote",
    description:
      "UI/UX design roles at Pakistani product studios creating user-centered digital experiences for web and mobile.",
    skills: ["Figma", "Adobe XD", "Prototyping", "User Research", "Design Systems"],
    location: "Karachi / Remote",
    city: "Karachi",
    salaryMin: 100000,
    salaryMax: 160000,
    experienceLevel: ExperienceLevel.JUNIOR,
    jobType: JobType.FULL_TIME,
    category: ["Design", "UI/UX"],
    applyUrl:
      "https://www.glassdoor.com/Job/pakistan-react-developer-jobs-SRCH_IL.0,8_IN192_KO9,24.htm",
  },
  {
    title: "Cybersecurity Analyst — Islamabad",
    description:
      "Cybersecurity analyst openings in Islamabad covering vulnerability assessments, SIEM monitoring, and incident response.",
    skills: ["Network Security", "SIEM", "Penetration Testing", "OWASP", "ISO 27001"],
    location: "Islamabad (On-site)",
    city: "Islamabad",
    salaryMin: 160000,
    salaryMax: 260000,
    experienceLevel: ExperienceLevel.MID,
    jobType: JobType.FULL_TIME,
    category: ["Cybersecurity"],
    applyUrl: "https://pk.indeed.com/q-artificial-intelligence-l-islamabad-jobs.html",
  },
  {
    title: "Junior Developer Internship (Paid) — Remote",
    description:
      "Paid tech internships at Pakistani software houses. Hands-on experience with real products and senior developer mentorship.",
    skills: ["HTML", "CSS", "JavaScript", "React", "Vue.js", "Git"],
    location: "Remote (Pakistan)",
    city: "Remote",
    salaryMin: 40000,
    salaryMax: 70000,
    experienceLevel: ExperienceLevel.JUNIOR,
    jobType: JobType.INTERNSHIP,
    category: ["Internship", "Frontend"],
    applyUrl:
      "https://pk.indeed.com/q-mern-stack-developer,internship,software-house-l-karachi-jobs.html",
  },
  {
    title: "Senior Software Engineer — Lahore",
    description:
      "Senior engineering roles at top Pakistani tech companies. Technical leadership, system architecture, and mentoring junior developers.",
    skills: ["System Design", "Node.js", "Python", "PostgreSQL", "Microservices", "AWS"],
    location: "Lahore (On-site)",
    city: "Lahore",
    salaryMin: 300000,
    salaryMax: 500000,
    experienceLevel: ExperienceLevel.SENIOR,
    jobType: JobType.FULL_TIME,
    category: ["Full Stack", "Backend"],
    applyUrl: "https://pk.indeed.com/q-junior-aws-devops-jobs.html",
  },
];

async function main() {
  console.log("🌱 Seeding aggregated job listings...");

  // 1. Upsert the aggregator recruiter account
  let aggregator = await prisma.user.findUnique({ where: { email: AGGREGATOR_EMAIL } });

  if (!aggregator) {
    const passwordHash = await bcrypt.hash("Aggregator@PakTechJobs2026!", 12);
    aggregator = await prisma.user.create({
      data: {
        email: AGGREGATOR_EMAIL,
        passwordHash,
        name: AGGREGATOR_NAME,
        role: Role.RECRUITER,
        companyName: AGGREGATOR_COMPANY,
        recruiterVerified: true,
        responseRate: 100,
      },
    });
    console.log(`✅ Created aggregator account: ${AGGREGATOR_EMAIL}`);
  } else {
    console.log(`ℹ️  Aggregator account already exists: ${AGGREGATOR_EMAIL}`);
  }

  // 2. Seed each job (skip if already exists by title + recruiterId)
  let created = 0;
  let skipped = 0;

  for (const job of SEED_JOBS) {
    const existing = await prisma.jobPost.findFirst({
      where: { title: job.title, recruiterId: aggregator.id },
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.jobPost.create({
      data: {
        recruiterId: aggregator.id,
        title: job.title,
        description: job.description,
        skills: job.skills,
        location: job.location,
        city: job.city,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        experienceLevel: job.experienceLevel,
        jobType: job.jobType,
        category: job.category,
        applyUrl: job.applyUrl,
        isActive: true,
        isClosed: false,
        requiredFields: ["name", "email"],
      },
    });

    created++;
    console.log(`  ✅ Created: ${job.title}`);
  }

  console.log(`\n🎉 Done! Created: ${created}, Skipped (already exist): ${skipped}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
