import { NextResponse, NextRequest } from "next/server";
import Groq from "groq-sdk";

export async function GET(request: NextRequest) {
    // Instantiated here (runtime) so Next.js build doesn't fail when the env var is absent
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const chatCompletion = await groq.chat.completions.create({
        messages: [
            {
                role: "user",
                content: "How i can center a div",
            },
        ],
        model: "openai/gpt-oss-120b",
    });

    return NextResponse.json({
        response: chatCompletion.choices[0]?.message?.content || "",
        models: await groq.models.list(),
    });
}