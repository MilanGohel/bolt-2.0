import { create } from "zustand";
import { combine } from "zustand/middleware";

export interface Message {
  parts: {text: string}[];
  role: "user" | "model";
}

type FilesMap = Record<string, { code: string }>;
type DepsMap = Record<string, string>;
type Template = "react-ts" | "node";

interface WorkspaceState {
  files: FilesMap;
  dependencies: DepsMap;
  devDependencies?: DepsMap;
  template: Template;
  messages: Message[];
  isGenerating: boolean;
  prompt: string;
}

interface WorkspaceActions {
  setFiles: (files: FilesMap) => void;
  setDependencies: (dependencies: DepsMap) => void;
  setTemplate: (template: Template) => void;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setPrompt: (prompt: string) => void;
  setDevDependencies: (devDependencies: DepsMap) => void;
}

export const useWorkspace = create<WorkspaceState & WorkspaceActions>(
  combine<WorkspaceState, WorkspaceActions>(
    {
      files: {} as FilesMap,
      dependencies: {} as DepsMap,
      template: "react-ts" as Template,
      messages: [] as Message[],
      isGenerating: false,
      prompt: "",
      devDependencies: {} as DepsMap,
    },
    (set, get) => ({
      setFiles: (files) => set({ files }),
      setDependencies: (dependencies) => set({ dependencies }),
      setTemplate: (template) => set({ template }),
      addMessage: (message) => set({ messages: [...get().messages, message] }),
      setMessages: (messages) => set({ messages }),
      setIsGenerating: (isGenerating) => set({ isGenerating }),
      setPrompt: (prompt) => set({ prompt }),
      setDevDependencies: (devDependencies) => set({ devDependencies }),
    })
  )
);
