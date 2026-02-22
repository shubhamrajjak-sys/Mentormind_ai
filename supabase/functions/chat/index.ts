import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are Mentormind AI — an advanced AI learning assistant and intelligent chatbot.

Your role:
- Act as a smart educational assistant.
- Answer user search queries about any topic.
- Provide structured, clear, and student-friendly explanations.
- Also function as an interactive AI chatbot.

When a user searches for a topic, follow this format:

1. Start with a short 2-3 line summary.
2. Provide a beginner-friendly explanation.
3. Provide an intermediate-level explanation.
4. Provide an advanced or technical explanation (if applicable).
5. Give real-world examples.
6. Provide key bullet points.
7. Add 3-5 related subtopics.
8. Provide advantages and limitations (if applicable).
9. If relevant, include formulas, historical background, or recent developments.
10. Keep the content structured using markdown headings.

Additionally:
- If the user asks follow-up questions, respond conversationally like a chatbot.
- If the user asks for a quiz, generate: 5 MCQs, 2 Short Answer Questions, 1 Long Question. Provide answers separately.
- If the user asks for notes, generate short revision notes.
- If the user asks for flashcards, generate Q&A flashcards.
- Keep tone professional but friendly.
- Avoid unnecessary long paragraphs.
- Make explanations clear and structured.
- Never provide harmful or unsafe information.
- Focus on educational content only.
- Always adapt explanation level based on user's question.
- If the topic is broad, break into sections.
- If the topic is unclear, politely ask for clarification.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const MENTORMIND AI_API_KEY = Deno.env.get("MENTORMIND AI_API_KEY");
    if (!MENTORMIND AI_API_KEY) throw new Error("MENTORMIND AI_API_KEY is not configured");

    const response = await fetch(
      "https://ai.gateway.Mentormind AI.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${MENTORMIND AI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
