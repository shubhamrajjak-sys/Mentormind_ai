import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const MENTORMIND AI_API_KEY = Deno.env.get("MENTORMIND AI_API_KEY");
    if (!MENTORMIND AI_API_KEY) throw new Error("MENTORMIND AI_API_KEY is not configured");

    const { fileData, fileType, fileName, action, userMessage } = await req.json();

    if (!fileData || !action) {
      return new Response(
        JSON.stringify({ error: "Missing fileData or action" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let systemPrompt = "";
    let userContent: unknown[] = [];
    const extraContext = userMessage ? `\n\nThe user also said: "${userMessage}"` : "";

    if (action === "summarize") {
      systemPrompt = `You are Mentormind AI — an advanced educational AI assistant.
When given content (text, image, or video frame), produce a well-structured educational summary:

## 📝 Summary
A concise 3-5 sentence overview.

## 🔑 Key Points
Bullet list of the most important takeaways.

## 📖 Important Definitions
Any key terms and their definitions found in the content.

## 💡 Important Concepts
Core concepts explained simply.

Special handling:
- If the content is a diagram: describe the diagram structure and meaning.
- If it contains math problems: solve them step-by-step.
- If it's handwritten notes: create a clean, structured version.
- If it's a video frame: describe what you see and infer the topic.

Keep it student-friendly, structured with markdown, and avoid unnecessary filler.`;
    } else if (action === "quiz") {
      systemPrompt = `You are Mentormind AI. Based on the provided content, generate:

## 📝 Quiz

### Multiple Choice Questions (5)
For each: question, 4 options (A-D), correct answer.

### Short Answer Questions (2)
Questions with brief model answers.

### Long Answer Question (1)
A detailed question with a comprehensive model answer.

Format everything in clean markdown.`;
    } else if (action === "flashcards") {
      systemPrompt = `You are Mentormind AI. Based on the provided content, generate 8-12 flashcards.

Format each flashcard as:

### Card [number]
**Q:** [question]
**A:** [answer]

Keep answers concise. Cover the most important concepts from the content.`;
    }

    const isImage = fileType?.startsWith("image/");
    const isVideo = fileType?.startsWith("video/");

    if (isImage || isVideo) {
      userContent = [
        {
          type: "image_url",
          image_url: { url: `data:${fileType};base64,${fileData}` },
        },
        {
          type: "text",
          text: `Process this ${isVideo ? "video frame" : "image"}. File: ${fileName}. ${
            action === "summarize" ? "Analyze and summarize it." : 
            action === "quiz" ? "Generate a quiz from it." : 
            "Create flashcards from it."
          }${extraContext}`,
        },
      ];
    } else {
      userContent = [
        {
          type: "text",
          text: `Here is the content from "${fileName}":\n\n${fileData}\n\n${
            action === "summarize" ? "Summarize this content." : 
            action === "quiz" ? "Generate a quiz from this content." : 
            "Create flashcards from this content."
          }${extraContext}`,
        },
      ];
    }

    const response = await fetch(
      "https://ai.gateway.Mentormind AI.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${MENTORMIND AI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContent },
          ],
          stream: false,
        }),
      }
    );

    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: "AI processing failed. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || "No result generated.";

    return new Response(
      JSON.stringify({ result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("process-file error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
