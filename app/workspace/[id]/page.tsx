"use client";
import ChatView from "@/components/ChatView";
import CodeView from "@/components/CodeView";

type WorkSpacePageProps = {

}

export default function Workspace({ }: WorkSpacePageProps) {
    return (
        <>
            <div className="flex flex-row gap-4 p-4">
                <ChatView />
                <CodeView />
            </div>
        </>
    )
}