import { useCode } from "@/context/CodeContext";
import { MessagesContext } from "@/context/MessagesContext";
import { useContext, useEffect } from "react";

export const useCodeParser = () => {
  const { updateFiles } = useCode();
  const { messages } = useContext(MessagesContext);

  const parseAIResponse = (content: string) => {
    try {
      const response = JSON.parse(content);
      if (response.files) {
        return response.files;
      }
    } catch (error) {
      console.log("Failed to parse AI response as JSON:", error);
    }
    return {};
  };

  useEffect(() => {
    if (messages && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "model") {
        const parsedFiles = parseAIResponse(lastMessage.content);
        if (parsedFiles && Object.keys(parsedFiles).length > 0) {
          updateFiles(parsedFiles);
        }
      }
    }
  }, [messages, updateFiles]);

  return { parseAIResponse };
};
