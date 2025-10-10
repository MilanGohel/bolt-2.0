"use client";
import ChatView from "@/components/ChatView";
import CodeView from "@/components/CodeView";
import { WorkspaceContext } from "@/context/WorkspaceContext";
import { api } from "@/convex/_generated/api";
import { useConvex, useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { useContext, useEffect } from "react";

type WorkSpacePageProps = {

}

export default function Workspace({ }: WorkSpacePageProps) {
    const params = useParams<{ id: string }>();
    const workspaceId = params.id as string;
    const { setCurrentWorkSpace } = useContext(WorkspaceContext);

    const workspaceData = useQuery(api.workspaces.GetWorkspace, { workspaceId });

    useEffect(() => {
        if (workspaceData) {
            setCurrentWorkSpace({
                workspaceId: workspaceData._id,
                messages: workspaceData.messages ?? [],
            });
            console.log("Workspace data loaded:", workspaceData);
        }
    }, [workspaceData, setCurrentWorkSpace]);

    if (!workspaceData) {
        return <div>Loading Workspace...</div>;
    }
    return (
        <>
            <div className="flex flex-row gap-4 p-4">
                <ChatView />
                <CodeView />
            </div>
        </>
    )
}