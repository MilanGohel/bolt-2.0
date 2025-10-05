"use client";

import React, { useContext, useState } from "react";
import { Button } from "./ui/button";
import { ArrowRight, Link2 } from "lucide-react";
import { MessagesContext } from "@/context/MessagesContext";
import { UserDetailsContext } from "@/context/UserDetailsContext";
import SignInDialog from "./SignInDialog";
import { auth } from "@clerk/nextjs/server";
import { useUser } from "@clerk/nextjs";

const suggestion = [
  "Create todo app",
  "Build a landing page",
  "Make a weather dashboard",
  "Design a portfolio site",
  "Build a chat application",
];

function Hero() {
  const { messages, setMessages } = useContext(MessagesContext);
  const { isSignedIn } = useUser();
  const onGenerateClick = (input: string) => {
    if (!isSignedIn) {
      setIsSignInDialogOpen(true);
      return;
    }

    setMessages({
      content: input,
      role: "user",
    });
  };

  const [prompt, setPrompt] = useState<string>("");
  const [isSignInDialogOpen, setIsSignInDialogOpen] = useState<boolean>(false);
  return (
    <div className="flex flex-col items-center mt-32 xl:mt-48 gap-3">
      <h2 className="text-4xl font-bold ">What should we build today?</h2>
      <p className="text-muted-foreground">
        create stunning apps & websites by chatting with AI.
      </p>

      <div className="flex flex-col items-start gap-3 w-full max-w-2xl p-4 rounded-lg border border-zinc-300 dark:border-zinc-700 outline-none text-shadow-white dark:bg-zinc-900 bg-white">
        <div className="w-full max-w-3xl h-32 flex flex-row ">
          <textarea
            onChange={(e) => setPrompt(e.target.value)}
            name="prompt"
            id="prompt"
            placeholder="Type your idea and we will build it for you."
            className="w-full max-w-2xl h-32 rounded-lg outline-none text-shadow-white scrollbar-hide"
          ></textarea>
          <Button
            className="cursor-pointer"
            onClick={() => onGenerateClick(prompt)}
          >
            <ArrowRight />
          </Button>
        </div>
        <Button variant={"outline"} className="cursor-pointer">
          <Link2 />
        </Button>
      </div>

      {/* Suggestion Pills */}
      <div className="flex flex-wrap gap-2 justify-center mt-4 max-w-2xl">
        {suggestion.map((suggestion, index) => (
          <button
            key={index}
            className="px-3 py-1.5 text-sm  hover:bg-gray-200  dark:hover:bg-gray-900 rounded-full border border-gray-200 dark:border-gray-700 transition-colors cursor-pointer"
            onClick={() => {
              onGenerateClick(suggestion);
            }}
          >
            {suggestion}
          </button>
        ))}
      </div>
      <SignInDialog
        isOpen={isSignInDialogOpen}
        onOpenChange={setIsSignInDialogOpen}
      />
    </div>
  );
}

export default Hero;
