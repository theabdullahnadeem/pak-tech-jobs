import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { auth } from "@/lib/auth";
import { rateLimitByUser, RATE_LIMITS } from "@/lib/rateLimit";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await rateLimitByUser(session.user.id, RATE_LIMITS.ai);
  if (rl) return rl;

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { resumeText, jobPostId } = body as Record<string, unknown>;

  if (!resumeText || typeof resumeText !== "string" || resumeText.trim().length < 50) {
    return NextResponse.json({ error: "resumeText is required (min 50 chars)" }, { status: 400 });
  }
  if (!jobPostId || typeof jobPostId !== "string") {
    return NextResponse.json({ error: "jobPostId is required" }, { status: 400 });
  }

  const job = await prisma.jobPost.findUnique({
    where: { id: jobPostId },
    select: { title: true, description: true, skills: true, experienceLevel: true },
  });

  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

    const prompt = `You are an expert technical recruiter analyzing a resume against a job posting.

JOB POSTING:
Title: ${job.title}
Required Skills: ${job.skills.join(", ")}
Experience Level: ${job.experienceLevel}
Description: ${job.description.slice(0, 500)}

RESUME:
${resumeText.slice(0, 2000)}

Analyze the match and return ONLY valid JSON:
{
  "matchScore": <0-100>,
  "matchLevel": "<Excellent|Good|Fair|Poor>",
  "matchingSkills": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"],
  "strengths": ["strength1", "strength2", "strength3"],
  "gaps": ["gap1", "gap2"],
  "recommendation": "<1-2 sentence overall recommendation>"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    const text = response.text?.trim() || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ error: "AI returned invalid format" }, { status: 500 });

    return NextResponse.json(JSON.parse(jsonMatch[0]));
  } catch (error) {
    console.error("[AI match-resume] error:", error);
    return NextResponse.json({ error: "AI analysis failed" }, { status: 500 });
  }
}
