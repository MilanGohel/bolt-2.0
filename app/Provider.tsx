"use client";
import React, { useEffect, useState, useMemo } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Message, MessagesContext } from "@/context/MessagesContext";
import { CodeProvider } from "@/context/CodeContext";

function Provider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>();

  const contextValue = useMemo(() => ({
    messages,
    setMessages
  }), [messages]);

  return (
    <>
        <MessagesContext.Provider value={contextValue}>
          <CodeProvider>
            {children}
          </CodeProvider>
        </MessagesContext.Provider>
    </>
  );
}

export default Provider;
