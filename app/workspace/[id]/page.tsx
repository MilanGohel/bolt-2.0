"use client";
import ChatView from "@/components/ChatView";
import CodeView from "@/components/CodeView";
import { api } from "@/convex/_generated/api";
import { Message, useWorkspace } from "@/store/useWorkspace";
import { AIResponse, isAIResponse } from "@/types/aiResponse";
import { RedirectToSignIn } from "@clerk/nextjs";
import { SandpackProvider, useActiveCode, useSandpack } from "@codesandbox/sandpack-react";
import { decode } from "@toon-format/toon";
import { Authenticated, AuthLoading, Unauthenticated, useAction, useConvex, useMutation, useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";

export default function Workspace() {
    const { id: workspaceId } = useParams<{ id: string }>();
    if (!workspaceId) {
        return <div>No workspace ID provided.</div>;
    }

    const {
        files,
        dependencies,
        devDependencies,
        template
    } = useWorkspace();

    // keep provider key stable so SandpackProvider is NOT remounted on every files change
    // const providerKey = useMemo(() => `sp-${workspaceId}-${template}`, [workspaceId, template]);


    useEffect(() => {
        console.log(files + "files changed in workspace page");
    }, [files]);
    return (
        <>
            <AuthLoading>
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </AuthLoading>
            <Unauthenticated>
                <RedirectToSignIn />
            </Unauthenticated>
            <Authenticated>
                <WorkspaceContent workspaceId={workspaceId} />
            </Authenticated >
        </>
    )
}

function WorkspaceContent({ workspaceId }: { workspaceId: string }) {
    const convex = useConvex();
    const workspace = useQuery(api.workspaces.GetWorkspace, {
        workspaceId,
    });
    const { theme } = useTheme();

    const {
        messages,
        setMessages,
        files,
        setFiles,
        dependencies,
        devDependencies,
        setDevDependencies,
        setDependencies,
        template,
        setTemplate,
        addMessage,
        setIsGenerating,
        isGenerating,
        activeFile
    } = useWorkspace();
    const providerKey = useMemo(() => {
        const entries = Object.entries(files ?? {}).sort();
        const fingerprint = entries.map(([name, f]) => `${name}:${(f?.code?.length ?? 0)}`).join("|");
        return `sp-${template}-${fingerprint}`;
    }, [files, template]);
    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = useCallback(async () => {
        const workspaceData = await convex.query(api.workspaces.GetWorkspace, { workspaceId });
        if (!workspaceData) return;
        setMessages(workspaceData.messages);
        setDependencies(workspaceData.dependencies);
        setDevDependencies(workspaceData.devDependencies || {});

        setFiles(workspaceData.files);
        setTemplate(workspaceData.template ?? "react-ts");
        if (workspaceData.messages.length === 1 && workspaceData.messages[0].role === "user" && !isGenerating) {
            const parts = workspaceData.messages[0].parts as { text: string }[];
            generateAIResponse(parts.map(part => part.text).join(''), false);
        }
    }, [])

    const GenerateAIResponse = useAction(api.workspaces.GenerateAIResponse);
    const UpdateWorkspaceFileData = useMutation(api.workspaces.UpdateWorkspaceFileData);
    const AddWorkspaceMessage = useMutation(api.workspaces.AddWorkspaceMessage);

    const generateAIResponse = async (prompt: string, isFromButtonClick: boolean) => {
        setIsGenerating(true);

        if (isFromButtonClick) {
            addMessage({ role: "user", parts: [{ text: prompt }] } as Message);
            // await UpdateWorkspaceMessages({ workspaceId, messages: [...messages, { role: "user", parts: [{ text: prompt }] }] });
            await AddWorkspaceMessage({ workspaceId, message: { role: "user", parts: [{ text: prompt }] } });
        }
        // Get AI response (may be string or object)
        debugger;
        const response = await GenerateAIResponse({ prompt, history: messages });
        if (!response) return;

        // Ensure we always store a string in parts[].text
        const responseText = typeof response === "string" ? response : JSON.stringify(response);

        const modelMsg = { role: "model", parts: [{ text: responseText }] } as Message;
        addMessage(modelMsg);

        if (isFromButtonClick) {

            // await UpdateWorkspaceMessages({ workspaceId, messages: [...messages, modelMsg] });
            await AddWorkspaceMessage({ workspaceId, message: modelMsg });
        }
        else {

            // await UpdateWorkspaceMessages({ workspaceId, messages: [...(workspace?.messages || []), modelMsg] });
            await AddWorkspaceMessage({ workspaceId, message: modelMsg });
        }

        // Strip possible code fences and parse JSON payload
        let aiResponse = responseText
            .replace(/```json\s*/i, "")
            .replace(/\s*```$/i, "")
            .replace(/```\s*/i, "")
            .replace(/\s*```$/i, "");

        let fileData: any;
        try {
            fileData = JSON.parse(aiResponse);
        } catch (error) {
            console.error("Error parsing AI response as JSON:", error);
            return;
        }

        let newFiles, newDeps, newDevDeps;
        if (isFromButtonClick) {
            newFiles = { ...files, ...fileData.files };
            newDeps = { ...dependencies, ...fileData.dependencies };
            newDevDeps = { ...devDependencies, ...fileData.devDependencies }
        }
        else {
            newFiles = { ...workspace?.files, ...fileData.files };
            newDeps = { ...workspace?.dependencies, ...fileData.dependencies };
            newDevDeps = { ...workspace?.devDependencies, ...fileData.devDependencies }
        }

        setFiles(newFiles);
        setDependencies(newDeps);
        setDevDependencies(newDevDeps);

        await UpdateWorkspaceFileData({ workspaceId, fileData: { files: newFiles, dependencies: newDeps, devDependencies: newDevDeps } });

        setIsGenerating(false);
    }
    const onGenerateClick = (prompt: string) => {
        console.log("Generate clicked with prompt:", prompt);

        // Handle generate click
        generateAIResponse(prompt, true);
    }


    if (!workspace) return <div>Loading...</div>;

    return (
        <>
            <div className="flex flex-row gap-4 p-4">
                <ChatView
                    messages={messages}
                    onGenerateClick={onGenerateClick}
                    isGenerating={isGenerating}
                />
                <SandpackProvider
                    key={providerKey}
                    theme={theme === "dark" ? "dark" : "light"}
                    template={template}
                    files={files}
                    customSetup={{
                        dependencies,
                        devDependencies
                    }}
                    options={{
                        externalResources: ["https://cdn.tailwindcss.com/"],
                        recompileMode: "immediate",
                        recompileDelay: 500,
                    }}
                    style={{ width: "100%" }}
                >
                    <CodeView
                        workspaceId={workspaceId}
                        isGenerating={isGenerating}
                        setFiles={setFiles}
                        files={files}
                        dependencies={dependencies}
                        template={template}
                    />
                </SandpackProvider>
            </div>
        </>
    )
}