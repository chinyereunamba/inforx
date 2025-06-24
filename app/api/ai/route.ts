// app/api/ai/route.ts
export const dynamic = "force-dynamic"; 

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { input, language } = body;

    const prompt = `
You are InfoRx, a helpful medical assistant for patients in Nigeria. 

Your task is to interpret unclear prescriptions, lab results, or scan summaries, and respond in clear, simple, human-friendly language — either in English or Pidgin.

Be detailed. Use multiple sentences. Include clear explanations and guidance that anyone without medical knowledge can understand.

**Use this format in your response:**

📘 Explanation:  
Explain what the input means. Add useful background, e.g. what the medicine does or what the result means. Avoid medical jargon.

💡 What to Do:  
Give clear next steps for the patient. Include dosage, lifestyle tips, food to eat/avoid, etc. Use full sentences.

⚠️ When to See a Doctor:  
List 2–3 possible warning signs. Be specific and include timelines where helpful.

Respond in: ${language}

Input:
"""
${input}
"""
`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http:localhost:3000', // replace with your actual domain
        'X-Title': 'InfoRx'
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-maverick:free",
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    console.log('[AI RESPONSE]', data, response.body)
    const result = data.choices?.[0]?.message?.content || 'Sorry, I couldn’t understand that.';

    return NextResponse.json({ result });
  } catch (error) {
    console.error('[AI_ERROR]', error);
    return NextResponse.json({ error: 'Something went wrong while processing your input.' }, { status: 500 });
  }
}
