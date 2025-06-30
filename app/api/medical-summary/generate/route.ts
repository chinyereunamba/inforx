export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { extractTextFromMultipleFiles } from "@/lib/utils/text-extraction.server";
import {
  GenerateSummaryRequest,
  GenerateSummaryResponse,
  AIExtractionResult,
} from "@/lib/types/medical-summaries";
import { v4 as uuidv4 } from "uuid";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: NextRequest
): Promise<NextResponse<GenerateSummaryResponse>> {
  try {
    const { recordIds }: GenerateSummaryRequest = await request.json();

    if (!recordIds || recordIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No record IDs provided",
        },
        { status: 400 }
      );
    }

    // Get the user from the request
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        {
          success: false,
          error: "Authorization header required",
        },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid authentication",
        },
        { status: 401 }
      );
    }

    // Fetch the medical records for the user
    const { data: records, error: recordsError } = await supabase
      .from("medical_records")
      .select("*")
      .in("id", recordIds)
      .eq("user_id", user.id);

    if (recordsError) {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to fetch records: ${recordsError.message}`,
        },
        { status: 500 }
      );
    }

    if (!records || records.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No records found",
        },
        { status: 404 }
      );
    }

    // Extract text from all files
    const fileUrls = records.map((record) => record.file_url);
    const fileNames = records.map((record) => record.title);

    const extractedTexts = await extractTextFromMultipleFiles(
      fileUrls,
      fileNames
    );

    // Combine all extracted text
    const combinedText = extractedTexts
      .filter((result) => result.success)
      .map((result) => `=== ${result.fileName} ===\n${result.text}`)
      .join("\n\n");

    if (!combinedText.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "No text could be extracted from the provided records",
        },
        { status: 400 }
      );
    }

    // Generate AI summary
    const aiSummary = await generateAISummary(combinedText);

    // Store the summary in the database
    const { data: summary, error: insertError } = await supabase
      .from("medical_summaries")
      .insert({
        user_id: user.id,
        summary_text: aiSummary.summary_text,
        conditions_identified: aiSummary.conditions_identified,
        medications_mentioned: aiSummary.medications_mentioned,
        tests_performed: aiSummary.tests_performed,
        patterns_identified: aiSummary.patterns_identified,
        risk_factors: aiSummary.risk_factors,
        recommendations: aiSummary.recommendations,
        record_count: records.length,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to save summary: ${insertError.message}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error("Error generating medical summary:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

async function generateAISummary(
  combinedText: string
): Promise<AIExtractionResult> {
  const prompt = `Summarize the following medical records into a health profile for a Nigerian patient.

Return in **strict JSON format** with the following fields:
- summary_text
- conditions_identified
- medications_mentioned
- tests_performed
- patterns_identified
- risk_factors
- recommendations

Respond with only the JSON. Do not include any explanation.

Medical Records:
${combinedText}`;

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer":
            process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
          "X-Title": "InfoRx Medical Summary",
        },
        body: JSON.stringify({
          model: "anthropic/claude-3.5-sonnet",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.1,
          max_tokens: 2000,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content?.trim();

    if (!aiResponse) {
      throw new Error("No response from AI service");
    }

    console.log("AI raw response:", aiResponse);

    // Try to extract JSON from the response using regex
    const match = aiResponse.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON object found in AI response");

    const parsed = JSON.parse(match[0]);

    return {
      summary_text: parsed.summary_text || "Summary generated successfully",
      conditions_identified: parsed.conditions_identified || [],
      medications_mentioned: parsed.medications_mentioned || [],
      tests_performed: parsed.tests_performed || [],
      patterns_identified: parsed.patterns_identified || [],
      risk_factors: parsed.risk_factors || [],
      recommendations: parsed.recommendations || [],
    };
  } catch (error) {
    console.error("AI summarization error:", error);

    return {
      summary_text:
        "Medical summary generated from uploaded records. Please review the extracted information carefully.",
      conditions_identified: ["Review required"],
      medications_mentioned: ["Review required"],
      tests_performed: ["Review required"],
      patterns_identified: ["Review required"],
      risk_factors: ["Review required"],
      recommendations: [
        "Please consult with a healthcare provider for detailed analysis",
      ],
    };
  }
}
