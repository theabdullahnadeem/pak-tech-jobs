import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const token = searchParams.get("token");
  const userId = searchParams.get("userId");

  if (!token || !userId) {
    return NextResponse.redirect(new URL("/login?error=InvalidVerificationLink", req.url));
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: new Date() },
    });
    return NextResponse.redirect(new URL("/login?verified=1", req.url));
  } catch {
    return NextResponse.redirect(new URL("/login?error=VerificationFailed", req.url));
  }
}
