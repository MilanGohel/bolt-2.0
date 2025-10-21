"use client";
import Lookup from "@/data/Lookup";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackFileExplorer,
} from "@codesandbox/sandpack-react";
import { useCallback, useContext, useEffect, useState } from "react";
import { MessagesContext } from "@/context/MessagesContext";
import axios from "axios";

export interface CodeViewProps {}

export default function CodeView() {
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code");
  const [files, setFiles] = useState<Record<string, { code: string }>>({});
  const [dependencies, setDependencies] = useState<Record<string, string>>({});
  const { messages, setMessages } = useContext(MessagesContext);
  const [isGenerating, setIsGenerating] = useState(false);
  const [template, setTemplate] = useState<"react-ts" | "node">("react-ts");
  const [hasGeneratedTemplate, setHasGeneratedTemplate] = useState(false);

  useEffect(() => {
    if (messages && messages.length > 0 && !isGenerating && !hasGeneratedTemplate) {
      const lastMessage = messages[messages.length - 1];
      console.log("Last message:", lastMessage);
      if (lastMessage.role === "user" && messages.length === 1) {
        setIsGenerating(true);
        setHasGeneratedTemplate(true);
        generateTemplate(lastMessage.content);
        generateAiResponse();
      }
      else if(lastMessage.role === "user"){
        setIsGenerating(true);
        generateAiResponse();
      } 
    }
  }, [messages, isGenerating, hasGeneratedTemplate]);

  const generateTemplate = useCallback(
    async (prompt: string) => {
      const response = await axios.post("/api/template", {
        prompt: prompt,
      });

      setTemplate(response.data.template);
      setFiles(response.data.files);
      setDependencies(response.data.dependencies);
      return response.data;
    },
    [messages]
  );

  const generateAiResponse = useCallback(
    async () => {
      try {
        const response = await axios.post("/api/chat", {
          messages: messages,
        });
        
        console.log("Response:", response.data);
        const aiResponse = response.data.content;
        console.log("AI Response content:", aiResponse);
        
        // Parse the AI response JSON
        try {
          // Strip markdown code blocks if present
          let cleanResponse = aiResponse;
          if (aiResponse.includes('```json')) {
            cleanResponse = aiResponse.replace(/```json\s*/, '').replace(/\s*```$/, '');
          } else if (aiResponse.includes('```')) {
            cleanResponse = aiResponse.replace(/```\s*/, '').replace(/\s*```$/, '');
          }
          
          const parsedResponse = JSON.parse(cleanResponse);
          if (parsedResponse.files) {
            const mergedFiles = { ...files, ...parsedResponse.files };
            setFiles(mergedFiles);
          }
          if (parsedResponse.dependencies) {
            const mergedDependencies = { ...dependencies, ...parsedResponse.dependencies };
            setDependencies(mergedDependencies);
          }
        } catch (error) {
          console.error("Error parsing AI response:", error);
        }
        
        setIsGenerating(false);
      } catch (error) {
        console.error("Error streaming response:", error);
      }
    },
    [messages]
  );

  return (
    <div className="flex-1 p-4 overflow-y-auto dark:bg-zinc-800 bg-zinc-100 rounded-lg w-full">
      {/* Segmented Control with Slider */}
      <div className="relative flex flex-row bg-zinc-900 rounded-full p-1 items-center mb-1 w-fit">
        {/* Sliding Background */}
        <div
          className="absolute h-6 bg-blue-600/25 rounded-full transition-all duration-300 ease-in-out"
          style={{
            width: "calc(50% - 8px)",
            left: "4px",
            transform:
              activeTab === "code" ? "translateX(0)" : "translateX(100%)",
          }}
        />

        <button
          onClick={() => setActiveTab("code")}
          className={`relative z-10 h-6 text-sm px-4 py-1 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center min-w-[60px] ${
            activeTab === "code"
              ? "text-blue-600"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Code
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`relative z-10 h-6 text-sm px-4 py-1 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center min-w-[60px] ${
            activeTab === "preview"
              ? "text-blue-600"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Preview
        </button>
      </div>
      <SandpackProvider
        key={`sandpack-${Object.keys(files).length}-${activeTab}`}
        theme={"dark"}
        files={Object.keys(files).length > 0 ? files : {
          "index.tsx": {
            code: "// Loading template...",
          }
        }}
        template={Object.keys(files).length > 0 ? undefined : template}
        customSetup={{
          dependencies: dependencies,
          entry: "index.tsx",
        }}
        options={{
          externalResources: ["https://cdn.tailwindcss.com/"],
          recompileMode: "delayed",
          recompileDelay: 300,
        }}
      >
        <SandpackLayout>
          {activeTab === "code" ? (
            <>
              <SandpackFileExplorer style={{ height: "80vh" }} />
              <SandpackCodeEditor style={{ height: "80vh" }} />
            </>
          ) : (
            <SandpackPreview style={{ height: "80vh" }} showNavigator={true} />
          )}
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}
