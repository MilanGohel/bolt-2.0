"use client";
import Header from "@/components/Header";
import React, { useEffect, useState } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Message, MessagesContext } from "@/context/MessagesContext";
import { UserDetails, UserDetailsContext } from "@/context/UserDetailsContext";
import { useConvex, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

function Provider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message>();
  const [userDetails, setUserDetails] = useState<UserDetails>();

  const convex = useConvex();

  useEffect(() => {
    IsAuthenticated();
  },[])
  
  const IsAuthenticated = async () => {
    const localUser = JSON.parse(localStorage.getItem("user") || "{}");
    if(!localUser.email || !localUser.uid) return false;
    
    // TODO: Add server-side token validation here
    // For now, this is still vulnerable to localStorage manipulation
    const result = await convex.query(api.users.GetUser, {email: localUser?.email});
    if (result) {
      setUserDetails({
        id: result._id,
        name: result.name,
        email: result.email,
        image: result.picture
      });
    }
    return result !== null;
  }
  return (
    <>
        <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
          <MessagesContext.Provider value={{ messages, setMessages }}>
            <UserDetailsContext.Provider value={{ userDetails, setUserDetails }}>
              <Header />
              {children}
            </UserDetailsContext.Provider>
          </MessagesContext.Provider>
        </NextThemesProvider>
    </>
  );
}

export default Provider;
