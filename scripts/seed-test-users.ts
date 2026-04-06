import { PrismaClient, Role, ExperienceLevel } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const USERS = [
  {
    email: "admin@test.com",
    password: "Test@123456",
    name: "Test Admin",
    role: Role.ADMIN,
  },
  {
    email: "recruiter@test.com",
    password: "Test@123456",
    name: "Sara Khan",
    role: Role.RECRUITER,
    companyName: "TechCorp Pakistan",
    businessEmail: "sara@techcorp.pk",
    recruiterVerified: true,
  },
  {
    email: "jobseeker@test.com",
    password: "Test@123456",
    name: "Ali Ahmed",
    role: Role.APPLICANT,
    skills: ["React", "TypeScript", "Node.js", "PostgreSQL"],
    experienceLevel: ExperienceLevel.MID,
    location: "Lahore, Pakistan",
    openToOpportunities: true,
    targetRoles: ["Frontend Developer", "Full Stack Developer"],
  },
];

async function main() {
  console.log("Seeding test users…\n");

  for (const user of USERS) {
    const existing = await prisma.user.findUnique({ where: { email: user.email } });

    if (existing) {
      console.log(`⚠  ${user.role} already exists: ${user.email}`);
      continue;
    }

    const passwordHash = await bcrypt.hash(user.password, 12);

    await prisma.user.create({
      data: {
        email: user.email,
        passwordHash,
        name: user.name,
        role: user.role,
        companyName: (user as { companyName?: string }).companyName,
        businessEmail: (user as { businessEmail?: string }).businessEmail,
        recruiterVerified: (user as { recruiterVerified?: boolean }).recruiterVerified ?? false,
        skills: (user as { skills?: string[] }).skills ?? [],
        experienceLevel: (user as { experienceLevel?: ExperienceLevel }).experienceLevel,
        location: (user as { location?: string }).location,
        openToOpportunities: (user as { openToOpportunities?: boolean }).openToOpportunities ?? false,
        targetRoles: (user as { targetRoles?: string[] }).targetRoles ?? [],
      },
    });

    console.log(`✓  Created ${user.role}: ${user.email}  /  password: ${user.password}`);
  }

  console.log("\nDone. Login credentials:");
  console.log("─────────────────────────────────────────");
  for (const u of USERS) {
    console.log(`  ${u.role.padEnd(10)}  ${u.email.padEnd(28)}  ${u.password}`);
  }
  console.log("─────────────────────────────────────────");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
