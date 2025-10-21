import { NextRequest, NextResponse } from "next/server";
// import { ai } from "@/lib/ai";
import { getSystemPrompt } from "@/utils/prompts";
import { GoogleGenAI } from "@google/genai";

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
    // console.log("History messages:", historyMessages);
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const chat = ai.chats.create({
        model: "gemini-2.5-flash",
        config: {
            systemInstruction: {
                role: "model",
                parts: [
                    {
                        text: getSystemPrompt()
                    }
                ]
            },
        },
        history: historyMessages
    })

    const response = await chat.sendMessage({
        message: userMessage.content,
    });
    
    // Create a readable stream
    // const stream = new ReadableStream({
    //   async start(controller) {
    //     try {
    //       for await (const chunk of response) {
    //         const text = chunk.text;
    //         if (text) {
    //           controller.enqueue(
    //             new TextEncoder().encode(`data: ${JSON.stringify({ content: text })}\n\n`)
    //           );
    //         }
    //       }
    //       controller.enqueue(
    //         new TextEncoder().encode(`data: [DONE]\n\n`)
    //       );
    //       controller.close();
    //     } catch (error) {
    //       controller.error(error);
    //     }
    //   }
    // });
    console.log("Response:", response);
    if(response.text) {
      return NextResponse.json({
        content: response.text
      });
    } else {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
