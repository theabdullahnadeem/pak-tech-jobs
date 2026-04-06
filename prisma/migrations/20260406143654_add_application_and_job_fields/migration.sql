-- CreateEnum
CREATE TYPE "Role" AS ENUM ('APPLICANT', 'RECRUITER', 'ADMIN');

-- CreateEnum
CREATE TYPE "PipelineStage" AS ENUM ('APPLIED', 'SEEN', 'SHORTLISTED', 'INTERVIEW', 'OFFER', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "RejectionReason" AS ENUM ('PORTFOLIO_GAP', 'SALARY_MISMATCH', 'SPECIFIC_SKILL_MISSING', 'ROLE_FILLED', 'OVERQUALIFIED');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('FULL_TIME', 'REMOTE', 'CONTRACT', 'INTERNSHIP', 'PART_TIME');

-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('JUNIOR', 'MID', 'SENIOR', 'LEAD');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('APPLICATION_STATUS_CHANGE', 'DIRECT_MESSAGE', 'SLA_WARNING', 'SLA_BREACH', 'REJECTION_REASON', 'RECRUITER_APPROVED', 'RECRUITER_REJECTED', 'SALARY_APPROVED', 'SALARY_REJECTED');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'APPLICANT',
    "emailVerified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "skills" TEXT[],
    "experienceLevel" "ExperienceLevel",
    "location" TEXT,
    "openToOpportunities" BOOLEAN NOT NULL DEFAULT false,
    "targetRoles" TEXT[],
    "companyName" TEXT,
    "businessEmail" TEXT,
    "recruiterVerified" BOOLEAN NOT NULL DEFAULT false,
    "suspended" BOOLEAN NOT NULL DEFAULT false,
    "responseRate" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "avgResponseTimeHours" DOUBLE PRECISION,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobPost" (
    "id" TEXT NOT NULL,
    "recruiterId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "skills" TEXT[],
    "location" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "salaryMin" INTEGER NOT NULL,
    "salaryMax" INTEGER NOT NULL,
    "experienceLevel" "ExperienceLevel" NOT NULL,
    "jobType" "JobType" NOT NULL,
    "category" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "isInactiveLowResponse" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "requiredFields" TEXT[] DEFAULT ARRAY['name', 'email']::TEXT[],

    CONSTRAINT "JobPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "jobPostId" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "stage" "PipelineStage" NOT NULL DEFAULT 'APPLIED',
    "rejectionReason" "RejectionReason",
    "recruiterNotes" TEXT,
    "applicantName" TEXT,
    "applicantEmail" TEXT,
    "applicantPhone" TEXT,
    "yearsOfExperience" INTEGER,
    "coverLetter" TEXT,
    "cvPublicId" TEXT,
    "cvFileName" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "firstSeenAt" TIMESTAMP(3),
    "firstActionAt" TIMESTAMP(3),
    "slaWarning7Sent" BOOLEAN NOT NULL DEFAULT false,
    "slaWarning13Sent" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageThread" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT,
    "applicantId" TEXT NOT NULL,
    "recruiterId" TEXT NOT NULL,
    "isHeadhunt" BOOLEAN NOT NULL DEFAULT false,
    "applicantAccepted" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryEntry" (
    "id" TEXT NOT NULL,
    "submittedById" TEXT NOT NULL,
    "roleTitle" TEXT NOT NULL,
    "experienceLevel" "ExperienceLevel" NOT NULL,
    "city" TEXT NOT NULL,
    "salaryAmount" INTEGER NOT NULL,
    "employmentType" "JobType" NOT NULL,
    "techStack" TEXT[],
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "evidenceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "SalaryEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeadhuntOutreach" (
    "id" TEXT NOT NULL,
    "recruiterId" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "declinedAt" TIMESTAMP(3),

    CONSTRAINT "HeadhuntOutreach_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemandSnapshot" (
    "id" TEXT NOT NULL,
    "skill" TEXT NOT NULL,
    "category" TEXT,
    "city" TEXT,
    "count" INTEGER NOT NULL,
    "classification" TEXT NOT NULL DEFAULT 'Neutral',
    "snapshotDate" TIMESTAMP(3) NOT NULL,
    "timeRange" INTEGER NOT NULL,

    CONSTRAINT "DemandSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "JobPost_city_idx" ON "JobPost"("city");

-- CreateIndex
CREATE INDEX "JobPost_jobType_idx" ON "JobPost"("jobType");

-- CreateIndex
CREATE INDEX "JobPost_experienceLevel_idx" ON "JobPost"("experienceLevel");

-- CreateIndex
CREATE INDEX "JobPost_isActive_isClosed_idx" ON "JobPost"("isActive", "isClosed");

-- CreateIndex
CREATE UNIQUE INDEX "Application_jobPostId_applicantId_key" ON "Application"("jobPostId", "applicantId");

-- CreateIndex
CREATE UNIQUE INDEX "MessageThread_applicationId_key" ON "MessageThread"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "HeadhuntOutreach_recruiterId_applicantId_key" ON "HeadhuntOutreach"("recruiterId", "applicantId");

-- CreateIndex
CREATE INDEX "DemandSnapshot_skill_snapshotDate_idx" ON "DemandSnapshot"("skill", "snapshotDate");

-- CreateIndex
CREATE UNIQUE INDEX "DemandSnapshot_skill_timeRange_snapshotDate_key" ON "DemandSnapshot"("skill", "timeRange", "snapshotDate");

-- AddForeignKey
ALTER TABLE "JobPost" ADD CONSTRAINT "JobPost_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobPostId_fkey" FOREIGN KEY ("jobPostId") REFERENCES "JobPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageThread" ADD CONSTRAINT "MessageThread_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageThread" ADD CONSTRAINT "MessageThread_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageThread" ADD CONSTRAINT "MessageThread_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "MessageThread"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryEntry" ADD CONSTRAINT "SalaryEntry_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeadhuntOutreach" ADD CONSTRAINT "HeadhuntOutreach_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeadhuntOutreach" ADD CONSTRAINT "HeadhuntOutreach_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
