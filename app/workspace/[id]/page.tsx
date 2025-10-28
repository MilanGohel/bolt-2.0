"use client";
import ChatView from "@/components/ChatView";
import CodeView from "@/components/CodeView";
import { api } from "@/convex/_generated/api";
import { Message, useWorkspace } from "@/store/useWorkspace";
import { useUser } from "@clerk/nextjs";
import { useAction, useConvex, useMutation, useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { useCallback, useEffect } from "react";

export default function Workspace() {
    const { id: workspaceId } = useParams<{ id: string }>();
    const {isSignedIn} = useUser();
    if (!workspaceId) {
        return <div>No workspace ID provided.</div>;
    }

    const convex = useConvex();
    const workspace = useQuery(api.workspaces.GetWorkspace, {
        workspaceId,
    });

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
        setPrompt
    } = useWorkspace();

    useEffect(() => {
        debugger;
        if(!isSignedIn) return;
        loadInitialData();
    }, []);

    const loadInitialData = useCallback(async () => {
        debugger;
        const workspaceData = await convex.query(api.workspaces.GetWorkspace, { workspaceId });
        if (!workspaceData) return;
        setMessages(workspaceData.messages);
        setDependencies(workspaceData.dependencies);
        setFiles(workspaceData.files);
        setTemplate(workspaceData.template ?? "react-ts");
        if (workspaceData.messages.length === 1 && workspaceData.messages[0].role === "user") {
            const parts = workspaceData.messages[0].parts as { text: string }[];
            debugger;
            generateAIResponse(parts.map(part => part.text).join(''), false);
        }
    }, [])

    const GenerateAIResponse = useAction(api.workspaces.GenerateAIResponse);
    const UpdateWorkspaceMessages = useMutation(api.workspaces.UpdateWorkspaceMessages);
    const UpdateWorkspaceFileData = useMutation(api.workspaces.UpdateWorkspaceFileData);

    const generateAIResponse = async (prompt: string, isFromButtonClick: boolean) => {
        setIsGenerating(true);
        if (isFromButtonClick) {
            setPrompt("");
            addMessage({ role: "user", parts: [{ text: prompt }] } as Message);
        }
        // Get AI response (may be string or object)
        const response = await GenerateAIResponse({ prompt, history: messages });
        if (!response) return;

        // Ensure we always store a string in parts[].text
        const responseText = typeof response === "string" ? response : JSON.stringify(response);

        const modelMsg = { role: "model", parts: [{ text: responseText }] } as Message;
        addMessage(modelMsg);
        
        if (isFromButtonClick) {
            await UpdateWorkspaceMessages({ workspaceId, messages: [...messages, { role: "user", parts: [{ text: prompt }] }, modelMsg] });
        }
        else {
            debugger;
            await UpdateWorkspaceMessages({ workspaceId, messages: [...(workspace?.messages || []), modelMsg] });
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
            newDevDeps = {...devDependencies, ...fileData.devDependencies}
        }
        else {
            newFiles = { ...workspace?.files, ...fileData.files };
            newDeps = { ...workspace?.dependencies, ...fileData.dependencies };
            newDevDeps = {...workspace?.devDependencies, ...fileData.devDependencies}
        }
        
        setFiles(newFiles);
        setDependencies(newDeps);

        await UpdateWorkspaceFileData({ workspaceId, fileData: { files: newFiles, dependencies: newDeps, devDependencies: newDevDeps } });
        setIsGenerating(false);
    }
    const onGenerateClick = (prompt: string) => {
        console.log("Generate clicked with prompt:", prompt);
        debugger;
        // Handle generate click
        generateAIResponse(prompt, true);
    }

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
                    files={files}
                    dependencies={dependencies}
                    template={template}
                />
            </div>
        </>
    )
}