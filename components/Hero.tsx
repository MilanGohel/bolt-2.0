"use client";

import React, { use, useContext, useState } from "react";
import { Button } from "./ui/button";
import { ArrowRight, Link2, Loader2 } from "lucide-react";
import SignInDialog from "./SignInDialog";
import { useUser } from "@clerk/nextjs";
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Message, useWorkspace } from "@/store/useWorkspace";

const suggestion = [
  "Create todo app",
  "Build a landing page",
  "Make a weather dashboard",
  "Design a portfolio site",
  "Build a chat application",
];

function Hero() {
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  
  const [prompt, setPrompt] = useState<string>("");
  const [isSignInDialogOpen, setIsSignInDialogOpen] = useState<boolean>(false);
  const CreateWorkSpace = useMutation(api.workspaces.CreateWorkspace);
  const GenerateWorkspaceName = useAction(api.workspaces.GenerateWorkspaceName);
  const ClassifyProjectType = useAction(api.workspaces.classifyProjectType);
  const SetWorkspaceTemplateFiles = useMutation(api.workspaces.SetWorkspaceTemplateFiles);

  const {messages, addMessage} = useWorkspace();
  const[isLoading, setIsLoading] = useState(false);
  const onGenerateClick = async (input: string) => {
    if (!isSignedIn) {
      setIsSignInDialogOpen(true);
      return;
    }
    if (input.trim().length === 0) return;
    
    setIsLoading(true);
    const msg = {
      parts: [{text: input}],
      role: "user",
    } as Message;
    
    addMessage(msg);
    const title = await GenerateWorkspaceName({ prompt: input });
    
    const template = await ClassifyProjectType({ prompt: input }) as "react-ts" | "node";
    
    const workspaceId = await CreateWorkSpace({
      //TODO: Generate name using AI
      name: title || "Unnamed Workspace",
      messages: [msg],
      template: template || "react-ts",
    });
    await SetWorkspaceTemplateFiles({ workspaceId, template });
    
    router.push(`/workspace/${workspaceId}`);
    setIsLoading(true);
  };

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
            disabled={prompt.trim().length === 0 || isLoading}
          >
            {
              isLoading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : <ArrowRight/>
            }
          
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
