import { createContext } from "react";

// Simple message type for the context
export interface Message {
  content: string;
  role: 'user' | 'model';
}

export const MessagesContext = createContext<{
  messages: Message | undefined;
  setMessages: React.Dispatch<React.SetStateAction<Message | undefined>>;
}>({
  messages: undefined,
  setMessages: () => {}
});