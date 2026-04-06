import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

/**
 * Guard for Job_Post publishing endpoints.
 *
 * Requirement 1.5 — a Recruiter's account must be Admin-verified before
 * they can publish Job_Posts.  Also blocks suspended accounts.
 *
 * @returns A 403 NextResponse if the check fails, or null if the caller
 *          may proceed.
 */
export async function requireVerifiedRecruiter(
  session: Session | null
): Promise<NextResponse | null> {
  // Must be authenticated
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Must hold the RECRUITER role
  if (session.user.role !== Role.RECRUITER) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Fetch live DB state — JWT may be stale
  const recruiter = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { recruiterVerified: true, suspended: true },
  });

  if (!recruiter) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (recruiter.suspended) {
    return NextResponse.json(
      { error: "Account suspended" },
      { status: 403 }
    );
  }

  if (!recruiter.recruiterVerified) {
    return NextResponse.json(
      { error: "Account pending verification" },
      { status: 403 }
    );
  }

  // All checks passed — caller may proceed
  return null;
}
