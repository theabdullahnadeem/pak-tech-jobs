import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  computeEnterpriseActivation,
  validateActivationPayload,
} from "@/lib/enterpriseTier";

export async function POST(request: Request) {
  // 1. Authentication
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Authorization — admin only
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 3. Parse request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    employerId,
    durationMonths,
    seats,
    accountManagerName,
  } = body as {
    employerId?: unknown;
    durationMonths?: unknown;
    seats?: unknown;
    accountManagerName?: unknown;
  };

  // 4. Validate employerId presence
  if (!employerId || typeof employerId !== "string") {
    return NextResponse.json({ error: "employerId is required" }, { status: 400 });
  }

  // 4. Validate durationMonths and seats via pure function
  const validationError = validateActivationPayload({
    durationMonths: durationMonths as number,
    seats: seats as number,
  });
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  // 5. Look up the employer
  const employer = await prisma.user.findFirst({
    where: { id: employerId, role: "RECRUITER" },
  });
  if (!employer) {
    return NextResponse.json({ error: "Employer not found" }, { status: 404 });
  }

  // 6. Compute the activation result (pure)
  const activation = computeEnterpriseActivation(new Date(), {
    durationMonths: durationMonths as number,
    seats: seats as number,
    accountManagerName:
      typeof accountManagerName === "string" ? accountManagerName : undefined,
  });

  // 7. Persist the update
  const updated = await prisma.user.update({
    where: { id: employerId },
    data: {
      tier: activation.tier,
      hasCvAccess: activation.hasCvAccess,
      maxRecruiterSeats: activation.maxRecruiterSeats,
      subscriptionExpiry: activation.subscriptionExpiry,
      accountManagerName: activation.accountManagerName,
    },
    select: {
      id: true,
      tier: true,
      maxRecruiterSeats: true,
      subscriptionExpiry: true,
      hasCvAccess: true,
      accountManagerName: true,
    },
  });

  // 8. Return the updated record
  return NextResponse.json(updated, { status: 200 });
}
