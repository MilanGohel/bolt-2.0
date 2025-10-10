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
    cachedWorkspaces: Workspace[];
    setCurrentWorkSpace: React.Dispatch<React.SetStateAction<Workspace | undefined>>;
    setCachedWorkspaces: React.Dispatch<React.SetStateAction<Workspace[]>>;
}>({
    // initial values
    setCurrentWorkSpace: () => {},
    cachedWorkspaces: [],
    setCachedWorkspaces: () => {},  
    workspace: undefined
});