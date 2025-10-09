import { Message } from "@/context/MessagesContext";
import { WorkspaceContext } from "@/context/WorkspaceContext";
import { useUser } from "@clerk/nextjs";
import { useContext } from "react";

export interface ChatViewProps {
    workspaceId: string;
    messages: Message[];
}

export default function ChatView() {
    const { workspace } = useContext(WorkspaceContext);
    const messages = workspace?.messages ?? [];
    return (
        <div className="w-full max-w-[20vw] p-4 overflow-y-auto dark:bg-transparent bg-zinc-100 rounded-lg">
            <div>
                {messages.length > 0 &&
                    messages.map((msg, index) => (
                        <div key={index}>
                            {msg.role === "user"
                                ? (
                                    <p></p>
                                )
                                : ("AI: ")}
                        </div>
                    ))
                }
            </div>
        </div>
    );
}