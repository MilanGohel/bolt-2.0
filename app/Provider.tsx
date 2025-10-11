"use client";
import React, { useEffect, useState } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Message, MessagesContext } from "@/context/MessagesContext";

function Provider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>();

  return (
    <>
        <MessagesContext.Provider value={{ messages, setMessages }}>
          {children}
        </MessagesContext.Provider>
    </>
  );
}

export default Provider;
