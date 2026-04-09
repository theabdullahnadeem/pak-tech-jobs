import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { auth } from "@/lib/auth";
import { rateLimitByUser, RATE_LIMITS } from "@/lib/rateLimit";
import { requireVerifiedRecruiter } from "@/lib/requireVerifiedRecruiter";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  const guard = await requireVerifiedRecruiter(session);
  if (guard) return guard;

  const rl = await rateLimitByUser(session!.user.id, RATE_LIMITS.ai);
  if (rl) return rl;

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { jobPostId } = body as Record<string, unknown>;
  if (!jobPostId || typeof jobPostId !== "string") {
    return NextResponse.json({ error: "jobPostId is required" }, { status: 400 });
  }

  // Verify recruiter owns this job
  const job = await prisma.jobPost.findUnique({
    where: { id: jobPostId },
    select: { id: true, title: true, skills: true, experienceLevel: true, recruiterId: true, description: true },
  });

  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
  if (job.recruiterId !== session!.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Get all APPLIED/SEEN applications for this job
  const applications = await prisma.application.findMany({
    where: { jobPostId, stage: { in: ["APPLIED", "SEEN"] } },
    select: {
      id: true,
      applicantName: true,
      yearsOfExperience: true,
      coverLetter: true,
      applicant: { select: { skills: true, experienceLevel: true, location: true } },
    },
  });

  if (applications.length === 0) {
    return NextResponse.json({ rankings: [], message: "No applications to rank" });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

    const candidateList = applications.map((app, i) =>
      `Candidate ${i + 1} (ID: ${app.id}):
- Name: ${app.applicantName || "Unknown"}
- Skills: ${app.applicant.skills.join(", ") || "Not listed"}
- Experience level: ${app.applicant.experienceLevel || "Unknown"}
- Years of experience: ${app.yearsOfExperience || "Not specified"}
- Location: ${app.applicant.location || "Not specified"}
- Cover letter excerpt: ${app.coverLetter ? app.coverLetter.slice(0, 200) : "None"}`
    ).join("\n\n");

    const prompt = `You are an expert technical recruiter. Rank these candidates for the following job:

Job: ${job.title}
Required skills: ${job.skills.join(", ")}
Experience level needed: ${job.experienceLevel}

Candidates:
${candidateList}

Rank all candidates from best to worst fit. For each candidate return:
1. Their ID
2. A score from 0-100
3. A 1-2 sentence reason

Return ONLY valid JSON in this exact format:
{
  "rankings": [
    { "applicationId": "...", "score": 85, "reason": "..." },
    ...
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    const text = response.text?.trim() || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ error: "AI returned invalid format" }, { status: 500 });

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[AI rank-candidates] error:", error);
    return NextResponse.json({ error: "AI ranking failed" }, { status: 500 });
  }
}
