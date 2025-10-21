"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { SandpackFile } from "@codesandbox/sandpack-react";

interface CodeContextType {
  files: Record<string, SandpackFile>;
  setFiles: React.Dispatch<React.SetStateAction<Record<string, SandpackFile>>>;
  updateFiles: (newFiles: Record<string, SandpackFile>) => void;
}

const CodeContext = createContext<CodeContextType>({
  files: {},
  setFiles: () => {},
  updateFiles: () => {},
});

export const CodeProvider = ({ children }: { children: ReactNode }) => {
  const [files, setFiles] = useState<Record<string, SandpackFile>>({});

  const updateFiles = (newFiles: Record<string, SandpackFile>) => {
    setFiles((prev) => ({
      ...prev,
      ...newFiles,
    }));
  };

  return (
    <CodeContext.Provider value={{ files, setFiles, updateFiles }}>
      {children}
    </CodeContext.Provider>
  );
};

export const useCode = () => {
  const context = useContext(CodeContext);
  if (!context) {
    throw new Error("useCode must be used within a CodeProvider");
  }
  return context;
};
