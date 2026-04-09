import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { auth } from "@/lib/auth";
import { rateLimit, rateLimitByUser, RATE_LIMITS } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (session?.user) {
      const rl = await rateLimitByUser(session.user.id, RATE_LIMITS.ai);
      if (rl) return rl;
    } else {
      const rl = await rateLimit(req, RATE_LIMITS.ai);
      if (rl) return rl;
    }

    const { resumeText } = await req.json();

    if (!resumeText || typeof resumeText !== "string" || resumeText.trim().length < 50) {
      return NextResponse.json(
        { error: "Please provide resume text with at least 50 characters." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key is not configured. Add GEMINI_API_KEY to your .env.local file." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are an expert tech resume reviewer specializing in Pakistan's tech job market. Analyze the following resume and provide a detailed review in exactly 4 sections. Return your response as valid JSON with this exact structure:

{
  "strengths": ["strength 1", "strength 2", "strength 3", ...],
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3", ...],
  "improvements": ["improvement suggestion 1", "improvement suggestion 2", ...],
  "overallReport": "A comprehensive 3-5 sentence overall assessment of the resume, including a rating out of 10 and key takeaways."
}

Rules:
- Provide at least 3 items for strengths, weaknesses, and improvements each
- Be specific and actionable in your suggestions
- Consider ATS optimization, formatting, keyword usage, quantified achievements
- Reference Pakistan's tech market where relevant
- Keep each bullet point concise (1-2 sentences max)
- The overall report should mention a score out of 10

Resume to analyze:
---
${resumeText.slice(0, 5000)}
---

Respond ONLY with the JSON object, no markdown formatting or extra text.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    const responseText = response.text ?? "";

    // Parse the JSON response
    let analysis;
    try {
      // Clean up any markdown formatting that might be present
      const cleanedText = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      analysis = JSON.parse(cleanedText);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      );
    }

    // Validate the response structure
    if (
      !analysis.strengths ||
      !analysis.weaknesses ||
      !analysis.improvements ||
      !analysis.overallReport
    ) {
      return NextResponse.json(
        { error: "AI response was incomplete. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(analysis);
  } catch (error: unknown) {
    console.error("Resume analysis error:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";

    // Handle rate limit errors gracefully
    if (message.includes("429") || message.includes("quota") || message.includes("Too Many Requests")) {
      return NextResponse.json(
        { error: "AI service is temporarily unavailable due to rate limits. Please wait a minute and try again." },
        { status: 429 }
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
