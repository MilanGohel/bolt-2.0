import { createContext } from "react";

// Simple message type for the context
export interface Message {
  content: string;
  role: 'user' | 'model';
}

export interface Workspace{
    workspaceId: string;
    messages: Message[] | undefined;
}
export const WorkspaceContext = createContext<{
    workspace: Workspace | undefined;
    setCurrentWorkSpace: React.Dispatch<React.SetStateAction<Workspace | undefined>>;
}>({
    // initial values
    setCurrentWorkSpace: () => {},  
    workspace: undefined
});