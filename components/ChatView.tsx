"use client";

import { Message, MessagesContext } from "@/context/MessagesContext";
import { useCode } from "@/context/CodeContext";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useCallback, useContext, useEffect, useState } from "react";
import { Button } from "./ui/button";
import { ArrowRight, Divide, Link2, Loader2 } from "lucide-react";
import { useConvex, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import ReactMarkDown from "react-markdown";
import axios from "axios";

export interface ChatViewProps {
  workspaceId: string;
  messages: Message[];
}

export default function ChatView() {
  const { messages, setMessages } = useContext(MessagesContext);
  const { updateFiles } = useCode();
  const { user } = useUser();
  const [prompt, setPrompt] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const params = useParams<{ id: string }>();
  const workspaceId = params.id as string;

  const convex = useConvex();

  // Parse AI response for code files
  const parseAIResponse = (content: string) => {
    try {
      const response = JSON.parse(content);
      if (response.files) {
        updateFiles(response.files);
      }
    } catch (error) {
      console.log("Failed to parse AI response as JSON:", error);
    }
  };

  // Load workspace data
  const workspaceData = useQuery(api.workspaces.GetWorkspace, { workspaceId });

  useEffect(() => {
    if (workspaceData) {
      setMessages(workspaceData.messages ?? []);
      console.log("Workspace data loaded:", workspaceData);
    }
  }, [workspaceData, setMessages]);

  // Trigger AI response when user sends a message
  // useEffect(() => {
  //   if (messages && messages.length > 0 && !isGenerating) {
  //     const lastMessage = messages[messages.length - 1];
  //     if (lastMessage.role === "user") {
  //       setIsGenerating(true);
  //       generateAiResponse(lastMessage.content);
  //     }
  //   }
  // }, [messages, isGenerating]);

  const generateAiResponse = useCallback(
    async (userInput: string) => {
      try {
        setPrompt("");
        const response = axios
            .post("/api/chat", {
                messages: messages,
            })
            .then((res) => {
                console.log("Response:", res);
                
            })
            .catch((err) => {
                console.error("Error streaming response:", err);
            });
      } catch (error) {
        console.error("Error streaming response:", error);
      }
    },
    [messages, workspaceId, convex]
  );

  const onGenerateClick = async (input: string) => {
    if (!input.trim()) return;

    // Add user message immediately
    const userMessage = { content: input, role: "user" as const };
    const updatedMessages = [...(messages || []), userMessage];
    setMessages(updatedMessages);

    // Save user message to database
    await convex.mutation(api.workspaces.UpdateWorkspaceMessages, {
      workspaceId: workspaceId,
      messages: updatedMessages,
    });
  };

  // Conditional rendering after all hooks
  if (!workspaceData) {
    return (
      <div className="flex flex-row gap-2 w-full max-w-[20vw] p-4">
        <Loader2 className="animate-spin" />
        Loading workspace...
      </div>
    );
  }

  if (!messages) {
    return (
      <div className="flex flex-row gap-2 w-full max-w-[20vw] p-4">
        <Loader2 className="animate-spin" />
        Loading chat...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[85vh] w-[25%]">
      {/* Chat section - takes remaining space */}
      <div className="flex-1 overflow-y-auto scrollbar-hide bg-gray-50 dark:bg-transparent rounded-lg ">
        <div>
          {messages.length > 0 &&
            messages.map((msg, index) => (
              <div key={index} className="mb-4">
                {msg.role === "user" ? (
                  // User Message: Aligned to the right
                  <div className="flex flex-row gap-2 bg-blue-500 dark:bg-zinc-900 p-3 rounded-lg w-[80%] ml-auto">
                    <div className="text-white text-sm w-full text-left">
                      {msg.content}
                    </div>
                    <Image
                      src={user?.imageUrl ?? ""}
                      height={30}
                      width={30}
                      alt="User Profile Image"
                      className="rounded-full"
                    />
                  </div>
                 ) : (
                   // AI Message: Aligned to the left
                   <div className="flex flex-row gap-2 bg-white dark:bg-zinc-700 p-3 rounded-lg w-[80%] mr-auto border border-gray-200 dark:border-transparent">
                     <div className="text-gray-800 dark:text-zinc-200 text-sm w-full text-left">
                       {(() => {
                         try {
                           const response = JSON.parse(msg.content);
                           return (
                             <div>
                               {response.projectTitle && (
                                 <h3 className="font-bold text-lg mb-2">{response.projectTitle}</h3>
                               )}
                               {response.explanation && (
                                 <p>{response.explanation}</p>
                               )}
                             </div>
                           );
                         } catch (error) {
                           // Fallback to markdown if not JSON
                           return <ReactMarkDown>{msg.content}</ReactMarkDown>;
                         }
                       })()}
                     </div>
                   </div>
                 )}
              </div>
            ))}
          {isGenerating && (
            <div className="flex flex-row gap-2 bg-white dark:bg-zinc-700 p-3 rounded-lg w-[80%] mr-auto border border-gray-200 dark:border-transparent">
              <Loader2 className="animate-spin" />
              <div className="text-gray-800 dark:text-zinc-200 text-sm w-full text-left">
                Generating response...
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input - fixed at bottom */}
      <div className="flex flex-col items-start gap-3 w-full p-4 border-t border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-lg">
        <div className="w-full flex flex-row gap-2">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            name="prompt"
            id="prompt"
            placeholder="Type your idea and we will build it for you."
            className="flex-1 h-20 rounded-lg outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-zinc-400 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 px-3 py-2 text-shadow-white scrollbar-hide resize-none"
          ></textarea>
          <Button
            className="cursor-pointer"
            onClick={() => onGenerateClick(prompt)}
            disabled={prompt.trim().length === 0}
          >
            <ArrowRight />
          </Button>
        </div>
        <Button variant={"outline"} className="cursor-pointer">
          <Link2 />
        </Button>
      </div>
    </div>
  );
}
