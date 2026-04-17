import { useContext } from "react";
import { ChatContext } from "./chat-context";

export const useChatContext = () => {
  const ctx = useContext(ChatContext);

  if (!ctx) {
    throw new Error("useChatContext must be inside ChatProvider");
  }

  return ctx;
};
