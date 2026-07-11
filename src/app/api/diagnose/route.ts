import { NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.5-flash";

export async function POST(request: Request) {
  try {
    const { answers, trigger_note, fallback_node } = await request.json();

    if (!GEMINI_API_KEY) {
      // Graceful offline fallback: return deterministic calculation
      return NextResponse.json({ resolved_node: fallback_node });
    }

    // Call Gemini API with Structured Output constraints
    const prompt = `
      You are a classification model inside a nervous-system regulation application called stateOS.
      Your task is to classify a user's free-text trigger note describing their state drift into one of five autonomic origins:
      
      1. "environment" — Change in physical locations, ambient conditions (e.g., lighting, room temperature, crowded spaces, noise).
      2. "perception" — Mental fog, cognitive overload, misinterpreting comments, or feeling overwhelmed by details.
      3. "internal_state" — Somatic exhaustion, rapid heart rate, nervous jitters, muscle tension, physiological tiredness.
      4. "identity" — Disconnected from values, people-pleasing behavior, feeling like they are acting a role rather than being themselves.
      5. "behavior" — Mindless scrolling, snapping at others, impulsive reactions, making decisions they second-guess.

      User free-text trigger note: "${trigger_note}"
      Survey responses: ${JSON.stringify(answers)}
      
      Select the single origin node that best fits where the drift initiated.
    `;

    const responseSchema = {
      type: "OBJECT",
      properties: {
        node: { 
          type: "STRING", 
          enum: ["environment", "perception", "internal_state", "identity", "behavior"] 
        }
      },
      required: ["node"]
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

    return NextResponse.json({ resolved_node: result.node || fallback_node });

  } catch (error) {
    // console.error(error);
    // Silent fallback to standard offline resolution
    return NextResponse.json({ resolved_node: "internal_state" });
  }
}
