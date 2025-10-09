"use client";
import ChatView from "@/components/ChatView";
import CodeView from "@/components/CodeView";
import { useParams } from "next/navigation";

type WorkSpacePageProps = {
    
}

export default function Workspace({ }: WorkSpacePageProps) {
    const params = useParams<{id:string}>();
    const workspaceId = params.id as string;

    return (
        <>
            <div className="flex flex-row gap-4 p-4">
                <ChatView />
                <CodeView />
            </div>
        </>
    )
}