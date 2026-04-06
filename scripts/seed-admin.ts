import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@paktechjobs.com";
  const password = "Admin@123456";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("Admin already exists:", email);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: "Admin",
      role: Role.ADMIN,
    },
  });

  console.log("Admin created:");
  console.log("  Email:", admin.email);
  console.log("  Password:", password);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
