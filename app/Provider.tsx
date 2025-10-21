"use client";
import React, { useEffect, useState } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Message, MessagesContext } from "@/context/MessagesContext";
import { CodeProvider } from "@/context/CodeContext";

function Provider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>();

  return (
    <>
        <MessagesContext.Provider value={{ messages, setMessages }}>
          <CodeProvider>
            {children}
          </CodeProvider>
        </MessagesContext.Provider>
    </>
  );
}

export default Provider;
