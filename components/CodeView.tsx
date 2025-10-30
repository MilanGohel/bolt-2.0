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
import { Fragment, useEffect, useEffectEvent, useMemo, useState } from "react";
import CodeEditor from "./CodeEditor";
import { debounce } from "@/lib/utils";
import { useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2 } from "lucide-react";

export interface CodeViewProps {
  files: Record<string, { code: string }>;
  dependencies: Record<string, string>;
  workspaceId: string;
  template: "react-ts" | "node";
  devDependencies?: Record<string, string>;
  setFiles: (files: Record<string, { code: string }>) => void;
  isGenerating: boolean;
}

export default function CodeView({ files, setFiles, dependencies, template, devDependencies, workspaceId, isGenerating }: CodeViewProps) {
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code");
  const { code } = useActiveCode();
  const { sandpack } = useSandpack();
  const convex = useConvex();
  const UpdateFileData = useMemo(
    () =>
      debounce((updatedFiles: Record<string, { code: string }>) => {

        convex.mutation(api.workspaces.UpdateWorkspaceFileData, {
          workspaceId,
          fileData: { files: updatedFiles },
        });
      }, 500),
    [workspaceId, convex]
  );

  useEffect(() => {
    const newCode = code ?? "";
    const existing = files?.[sandpack.activeFile.substring(1)]?.code ?? "";

    // avoid updating state if nothing changed
    if (newCode === existing) return;
    // pass the whole new files object (setFiles expects a full object)
    const updatedFiles = {
      ...files,
      [sandpack.activeFile.substring(1)]: { code: newCode },
    }

    sandpack.updateCurrentFile(newCode);
    // UpdateFileData(updatedFiles);
  }, [code, UpdateFileData, files, sandpack.activeFile, setFiles]);
  return (
    <div className="flex-1 p-4 overflow-y-auto bg-zinc-100 dark:bg-zinc-800 rounded-lg w-full">
      {/* Segmented Control with Slider */}
      <div className="relative flex flex-row bg-zinc-200 dark:bg-zinc-900 rounded-full p-1 items-center mb-1 w-fit">
        {/* Sliding Background */}
        <div
          className="absolute h-6 bg-blue-500/20 dark:bg-blue-600/25 rounded-full transition-all duration-300 ease-in-out"
          style={{
            width: "calc(50% - 8px)",
            left: "4px",
            transform: activeTab === "code" ? "translateX(0)" : "translateX(100%)",
          }}
        />

        <button
          onClick={() => setActiveTab("code")}
          className={`relative z-10 h-6 text-sm px-4 py-1 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center min-w-[60px] ${activeTab === "code"
              ? "text-blue-600 dark:text-blue-500"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
        >
          Code
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`relative z-10 h-6 text-sm px-4 py-1 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center min-w-[60px] ${activeTab === "preview"
              ? "text-blue-600 dark:text-blue-500"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
        >
          Preview
        </button>
      </div>

      <Fragment>
        <SandpackLayout>
          {isGenerating && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          <SandpackFileExplorer
            style={{
              height: "80vh",
              display: activeTab === "code" ? "" : "none",
            }}
          />
          <SandpackCodeEditor
            style={{
              height: "80vh",
              display: activeTab === "code" ? "" : "none",
            }}
          />
          <SandpackPreview
            style={{
              height: "80vh",
              display: activeTab === "preview" ? "" : "none",
            }}
            showNavigator
          />
        </SandpackLayout>
      </Fragment>
    </div>
  );
}
