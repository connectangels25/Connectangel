import { ChatProvider } from "@/context/ChatContext";
import ChatSidebar from "@/components/ChatSidebar";
import ChatArea from "@/components/ChatArea";
import PremiumModal from "@/components/PremiumModal";

export default function ChatPage() {
  return (
    <ChatProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <ChatSidebar />
        <ChatArea />
        <PremiumModal />
      </div>
    </ChatProvider>
  );
}
