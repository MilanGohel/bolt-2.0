"use client";

import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useState } from "react";
import { Button } from "./ui/button";
import { ArrowRight, Divide, Link2, Loader2 } from "lucide-react";
import ReactMarkDown from "react-markdown";
import { Message } from "@/store/useWorkspace";

export interface ChatViewProps {
  messages: Message[];
  onGenerateClick: (prompt: string) => void;
  isGenerating: boolean;  
  prompt: string;
  setPrompt: (prompt: string) => void;
}

export default function ChatView({messages, onGenerateClick, isGenerating, prompt, setPrompt}: ChatViewProps) {
  const { user } = useUser();
  
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
                      {msg.parts.map((part, idx) => (
                        <span key={idx}>{part.text}</span>
                      ))}
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
                           const response = JSON.parse(msg.parts.map(part => part.text).join(''));
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
                           return <ReactMarkDown>{msg && msg.parts && msg.parts.map(part => part.text).join('')}</ReactMarkDown>;
                         }
                       })()}
                     </div>
                   </div>
                 )}
              </div>
            ))}
          {isGenerating && (
            <div className="flex flex-row gap-2 bg-white dark:bg-zinc-700 p-3 rounded-lg w-[80%] mr-auto border border-gray-200 dark:border-transparent">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
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
            disabled={prompt.trim().length === 0 || isGenerating}
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
