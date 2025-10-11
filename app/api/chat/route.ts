import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    // Get the latest user message
    const userMessage = messages[messages.length - 1];
    if (!userMessage || userMessage.role !== "user") {
      return NextResponse.json(
        { error: "Last message must be from user" },
        { status: 400 }
      );
    }

    // Get all messages except the last one for history
    const historyMessages = messages.slice(0, -1);
    console.log("History messages:", historyMessages);
    
    const chat = ai.chats.create({
        model: "gemini-2.5-flash",
        history: historyMessages
    })
    // Initialize Gemini model
    // const response = await ai.models.generateContentStream({
    //   model: "gemini-2.5-flash",
    //   contents: userMessage.content,
    //   config: {
    //     maxOutputTokens: 300,
    //     systemInstruction: {
    //       role: "model",
    //       parts: [{ text: "You are a helpful assistant." }],
    //     },
    //   },
      
    // });

    const response = await chat.sendMessageStream({
        message: userMessage.content,
        config: {
            maxOutputTokens: 5000,
            thinkingConfig: {
                thinkingBudget: 5000,
            },
            systemInstruction: {
                role: "model",
                parts: [{ text: "You are a helpful assistant." }]
            }
        }
    })

    
    // Create a readable stream
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const text = chunk.text;
            if (text) {
              controller.enqueue(
                new TextEncoder().encode(`data: ${JSON.stringify({ content: text })}\n\n`)
              );
            }
          }
          controller.enqueue(
            new TextEncoder().encode(`data: [DONE]\n\n`)
          );
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
