"use client";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackFileExplorer,
  useActiveCode,
  useSandpack,
} from "@codesandbox/sandpack-react";
import { Fragment, useEffect, useEffectEvent, useState } from "react";
import CodeEditor from "./CodeEditor";

export interface CodeViewProps {
  files: Record<string, { code: string }>;
  dependencies: Record<string, string>;
  workspaceId: string;
  template: "react-ts" | "node";
  devDependencies?: Record<string, string>;
  setFiles: (files: Record<string, { code: string }>) => void;
}

export default function CodeView({ files, setFiles, dependencies, template, devDependencies, workspaceId }: CodeViewProps) {
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code");

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
          className={`relative z-10 h-6 text-sm px-4 py-1 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center min-w-[60px] ${activeTab === "code"
            ? "text-blue-600"
            : "text-zinc-400 hover:text-zinc-200"
            }`}
        >
          Code
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`relative z-10 h-6 text-sm px-4 py-1 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center min-w-[60px] ${activeTab === "preview"
            ? "text-blue-600"
            : "text-zinc-400 hover:text-zinc-200"
            }`}
        >
          Preview
        </button>
      </div>

      {/* <CodeEditor
        workspaceId={workspaceId}
        activeTab={activeTab}
        files={files}
        setFiles={setFiles}
      /> */}
    <Fragment>
        <SandpackLayout>
          <SandpackFileExplorer style={{ height: "80vh", display: activeTab === "code" ? "" : "none" }} />
          <SandpackCodeEditor style={{ height: "80vh", display: activeTab === "code" ? "" : "none" }} />
          <SandpackPreview style={{ height: "80vh", display: activeTab === "preview" ? "" : "none" }} showNavigator />
        </SandpackLayout>
      </Fragment>
    </div>
  );
}
