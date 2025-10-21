import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function GET() {
  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Ты помощник для интернет-аптеки." },
        { role: "user", content: "Сделай короткое описание: Витамин C 500 мг, 100 таблеток." },
      ],
      max_tokens: 60,
    });

    return NextResponse.json({
      ok: true,
      message: res.choices[0].message?.content,
    });
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      error: error.message,
    });
  }
}
