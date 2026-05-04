-- CreateEnum
CREATE TYPE "EmployerTier" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accountManagerName" TEXT,
ADD COLUMN     "hasCvAccess" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maxRecruiterSeats" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "subscriptionExpiry" TIMESTAMP(3),
ADD COLUMN     "tier" "EmployerTier" NOT NULL DEFAULT 'FREE';

-- AlterTable
ALTER TABLE "JobPost" ADD COLUMN     "isPremium" BOOLEAN NOT NULL DEFAULT false;
