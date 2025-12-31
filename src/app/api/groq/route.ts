import { NextResponse, NextRequest } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY });


export async function GET(request: NextRequest){
    const chatCompletion  = await groq.chat.completions.create({
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
        models: await groq.models.list()
    });
}