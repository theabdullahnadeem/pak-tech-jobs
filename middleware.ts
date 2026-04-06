import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

// Route → required role mapping
const PROTECTED_ROUTES: { pattern: RegExp; role: string }[] = [
  { pattern: /^\/admin(\/|$)/, role: "ADMIN" },
  { pattern: /^\/recruiter(\/|$)/, role: "RECRUITER" },
  { pattern: /^\/dashboard(\/|$)/, role: "APPLICANT" },
];

export default auth((req: NextRequest & { auth: { user?: { role?: string } } | null }) => {
  const { pathname } = req.nextUrl;

  const matched = PROTECTED_ROUTES.find(({ pattern }) => pattern.test(pathname));
  if (!matched) return NextResponse.next();

  const session = req.auth;

  if (!session?.user) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  const userRole = session.user.role;

  if (userRole !== matched.role) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("error", "Unauthorized");
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/recruiter/:path*", "/admin/:path*"],
};
