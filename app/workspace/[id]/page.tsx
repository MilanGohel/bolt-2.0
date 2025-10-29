"use client";
import ChatView from "@/components/ChatView";
import CodeView from "@/components/CodeView";
import { api } from "@/convex/_generated/api";
import { debounce } from "@/lib/utils";
import { Message, useWorkspace } from "@/store/useWorkspace";
import { RedirectToSignIn } from "@clerk/nextjs";
import { SandpackProvider, useActiveCode, useSandpack } from "@codesandbox/sandpack-react";
import { Authenticated, AuthLoading, Unauthenticated, useAction, useConvex, useMutation, useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
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
    const providerKey = useMemo(() => `sp-${workspaceId}-${template}`, [workspaceId, template]);
   
    return (
        <>
            <AuthLoading>
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </AuthLoading>
            <Unauthenticated>
                <RedirectToSignIn />
            </Unauthenticated>
            <Authenticated>
                <SandpackProvider
                    key={providerKey}
                    theme={"dark"}
                    template={template}
                    files={files}
                    customSetup={{
                        dependencies,
                        devDependencies
                    }}
                    options={{
                        externalResources: ["https://cdn.tailwindcss.com/"],
                        recompileDelay: 200,
                        recompileMode: "immediate"
                    }}
                >
                    <WorkspaceContent workspaceId={workspaceId} />
                </SandpackProvider>
            </Authenticated>
        </>
    )
}

function WorkspaceContent({ workspaceId }: { workspaceId: string }) {
     const convex = useConvex();
     const workspace = useQuery(api.workspaces.GetWorkspace, {
         workspaceId,
     });
     const { code } = useActiveCode();
     const { sandpack } = useSandpack();
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
        prompt,
        setPrompt,
        activeFile
    } = useWorkspace();

    useEffect(() => {
        debugger;
        console.log("hello ")
        loadInitialData();
    }, []);

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
        // setFiles(updatedFiles);
        UpdateFileData(updatedFiles);
    }, [code]);

    const loadInitialData = useCallback(async () => {
        debugger;
        const workspaceData = await convex.query(api.workspaces.GetWorkspace, { workspaceId });
        if (!workspaceData) return;
        setMessages(workspaceData.messages);
        setDependencies(workspaceData.dependencies);
        setDevDependencies(workspaceData.devDependencies || {});
        debugger;
        setFiles(workspaceData.files);
        setTemplate(workspaceData.template ?? "react-ts");
        if (workspaceData.messages.length === 1 && workspaceData.messages[0].role === "user" && !isGenerating) {
            const parts = workspaceData.messages[0].parts as { text: string }[];
            generateAIResponse(parts.map(part => part.text).join(''), false);
        }
    }, [])

    const GenerateAIResponse = useAction(api.workspaces.GenerateAIResponse);
    const UpdateWorkspaceMessages = useMutation(api.workspaces.UpdateWorkspaceMessages);
    const UpdateWorkspaceFileData = useMutation(api.workspaces.UpdateWorkspaceFileData);
    const AddWorkspaceMessage = useMutation(api.workspaces.AddWorkspaceMessage);

    const generateAIResponse = async (prompt: string, isFromButtonClick: boolean) => {
        debugger;
        if (isFromButtonClick) {
            setIsGenerating(true);
            setPrompt("");
            addMessage({ role: "user", parts: [{ text: prompt }] } as Message);
            // await UpdateWorkspaceMessages({ workspaceId, messages: [...messages, { role: "user", parts: [{ text: prompt }] }] });
            await AddWorkspaceMessage({ workspaceId, message: { role: "user", parts: [{ text: prompt }] } });
        }
        // Get AI response (may be string or object)
        const response = await GenerateAIResponse({ prompt, history: messages });
        if (!response) return;

        // Ensure we always store a string in parts[].text
        const responseText = typeof response === "string" ? response : JSON.stringify(response);

        const modelMsg = { role: "model", parts: [{ text: responseText }] } as Message;
        addMessage(modelMsg);

        if (isFromButtonClick) {
            debugger;
            // await UpdateWorkspaceMessages({ workspaceId, messages: [...messages, modelMsg] });
            await AddWorkspaceMessage({ workspaceId, message: modelMsg });
        }
        else {
            debugger;
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
        debugger;
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

    if (!workspace) return <div>Loading...</div>;

    return (
        <>
            <div className="flex flex-row gap-4 p-4">
                <ChatView
                    setPrompt={setPrompt}
                    prompt={prompt}
                    messages={messages}
                    onGenerateClick={onGenerateClick}
                    isGenerating={isGenerating}
                />
                <CodeView
                    workspaceId={workspaceId}
                    setFiles={setFiles}
                    files={files}
                    dependencies={dependencies}
                    template={template}
                />
            </div>
        </>
    )
}