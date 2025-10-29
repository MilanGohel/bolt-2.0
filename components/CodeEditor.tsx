"use client";
import { api } from "@/convex/_generated/api";
import { debounce } from "@/lib/utils";
import { useWorkspace } from "@/store/useWorkspace";
import { SandpackCodeEditor, SandpackFileExplorer, SandpackLayout, SandpackPreview, useActiveCode, useSandpack } from "@codesandbox/sandpack-react";
import { useConvex } from "convex/react";
import { useEffect, useMemo, useState } from "react";

export interface CodeEditorProps {
    files: Record<string, { code: string }>;
    setFiles: (files: Record<string, { code: string }>) => void;
    activeTab: "code" | "preview";
    workspaceId: string;
}

export default function CodeEditor({ activeTab }: CodeEditorProps) {
    const { sandpack } = useSandpack();
    const { setActiveFile } = useWorkspace();
    useEffect(() => {
        setActiveFile(sandpack.activeFile || "");
    }, [sandpack.activeFile])
    return (
        <SandpackLayout>
            <SandpackFileExplorer style={{ height: "80vh", display: activeTab === "code" ? "" : "none" }} />
            <SandpackCodeEditor style={{ height: "80vh", display: activeTab === "code" ? "" : "none" }} />
            <SandpackPreview style={{ height: "80vh", display: activeTab === "preview" ? "" : "none" }} showNavigator />
        </SandpackLayout>
    );
}