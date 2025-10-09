"use client";
import React, { useEffect, useState } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Message, MessagesContext } from "@/context/MessagesContext";
import { Workspace, WorkspaceContext } from "@/context/WorkspaceContext";

function Provider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>();
  const [workspace, setCurrentWorkSpace] = useState<Workspace>();

  return (
    <>
      <WorkspaceContext.Provider value={{ workspace, setCurrentWorkSpace }}>
        <MessagesContext.Provider value={{ messages, setMessages }}>
          {children}
        </MessagesContext.Provider>
      </WorkspaceContext.Provider>
    </>
  );
}

export default Provider;
