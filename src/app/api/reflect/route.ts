import { NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.5-pro";

export async function POST(request: Request) {
  try {
    const { description, anchor_type } = await request.json();

    if (!GEMINI_API_KEY) {
      // Graceful offline fallback: return static prompts based on type
      return NextResponse.json({ prompts: [] });
    }

    const prompt = `
      You are a reflective coaching assistant inside a nervous-system regulation application called stateOS.
      The user is saving an "Identity Anchor" which is a reference point representing when they felt fully and unmistakably like themselves.
      
      Anchor Type: ${anchor_type}
      Sensory Description: "${description}"

      Generate exactly 2 to 3 open-ended, non-prescriptive, and deeply somatic reflection prompts to help the user connect deeper with this state.
      The prompts should:
      - Invite sensory/body awareness (e.g. postures, muscle tone, breathing patterns).
      - Avoid promising outcomes or suggesting feelings.
      - Be concise (12-18 words max per prompt).
      - Read like a gentle inquiry, not a command.

      Provide the prompts in JSON format.
    `;

    const responseSchema = {
      type: "OBJECT",
      properties: {
        prompts: {
          type: "ARRAY",
          items: { type: "STRING" },
          description: "List of 2-3 short open-ended somatic reflection questions"
        }
      },
      required: ["prompts"]
    };

    const requestBody = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema
      }
    };

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      }
    );

    if (!res.ok) {
      throw new Error(`Gemini API returned status ${res.status}`);
    }

    const data = await res.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const result = JSON.parse(resultText);

    return NextResponse.json({ prompts: result.prompts || [] });

  } catch (error) {
    // console.error(error);
    return NextResponse.json({ prompts: [] });
  }
}
