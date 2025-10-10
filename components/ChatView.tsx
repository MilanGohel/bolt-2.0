import { Message } from "@/context/MessagesContext";
import { WorkspaceContext } from "@/context/WorkspaceContext";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useContext, useEffect } from "react";

export interface ChatViewProps {
    workspaceId: string;
    messages: Message[];
}

export default function ChatView() {
    const { workspace } = useContext(WorkspaceContext);
    const messages = workspace?.messages ?? [];
    const { user } = useUser();

    // Optional: Log messages when they update for debugging
    useEffect(() => {
        console.log("Messages updated:", workspace);
    }, [workspace]);

    if (!workspace) {
        return <div className="w-full max-w-[20vw] p-4">Loading chat...</div>;
    }

    return (
        <div className="flex flex-col w-full max-w-[20vw] p-4 overflow-y-auto dark:bg-transparent bg-zinc-100 rounded-lg">
            <div>
                {messages.length > 0 &&
                    messages.map((msg, index) => (
                        <div key={index} className="mb-4">
                            {msg.role === "user" ? (
                                // User Message: Aligned to the right
                                <div className="flex flex-row gap-2 bg-zinc-900 p-3 rounded-lg w-[80%] ml-auto">
                                    <div className="text-white text-sm w-full text-left">{msg.content}</div>
                                    <Image
                                        src={user?.imageUrl ?? ""}
                                        height={30}
                                        width={30}
                                        alt="User Profile Image"
                                        className="rounded-full"
                                    />
                                </div>
                            ) : (
                                // AI Message: Aligned to the left
                                <div className="flex flex-row gap-2 bg-zinc-700 p-3 rounded-lg w-[80%] mr-auto">
                                    <Image
                                        // Replace with your AI avatar URL
                                        src="/gemini-avatar.png" 
                                        height={30}
                                        width={30}
                                        alt="AI Avatar"
                                        className="rounded-full"
                                    />
                                    <div className="dark:text-zinc-200 text-sm w-full text-left">{msg.content}</div>
                                </div>
                            )}
                        </div>
                    ))}
            </div>
        </div>
    );
}