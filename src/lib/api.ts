const BASE_URL = "https://overfloridly-nonconvertible-avalyn.ngrok-free.dev";

const headers = {
  "Content-Type": "application/json",
  "ngrok-skip-browser-warning": "true",
};

type HistorySession =
  | {
      id?: string;
      title?: string;
    }
  | string;

type HistoryResponse = {
  sessions?: HistorySession[];
};

type HistoryMessage = {
  role?: string;
  content?: string;
  text?: string;
  message?: string;
};

type MessagesResponse = {
  messages?: HistoryMessage[];
};

export async function createNewChat(): Promise<{ thread_id: string }> {
  const res = await fetch(`${BASE_URL}/new_chat`, { headers });
  if (!res.ok) throw new Error("Failed to create new chat");
  return res.json();
}

export async function sendMessage(
  message: string,
  thread_id: string,
): Promise<{ response: string; message_count: number }> {
  const res = await fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers,
    body: JSON.stringify({ message, thread_id }),
  });

  if (!res.ok) {
    const text = await res.text();
    if (text.includes("PAYMENT_REQUIRED")) {
      throw new Error("PAYMENT_REQUIRED");
    }
    throw new Error("Failed to send message");
  }

  const data = await res.json();

  if (data.response?.includes?.("PAYMENT_REQUIRED") || data.error === "PAYMENT_REQUIRED") {
    throw new Error("PAYMENT_REQUIRED");
  }

  return {
    response: data.response ?? data.content ?? "",
    message_count: data.message_count ?? 0,
  };
}

export async function getChatHistory(): Promise<Array<{ id: string; title: string }>> {
  const res = await fetch(`${BASE_URL}/history`, { headers });
  if (!res.ok) throw new Error("Failed to fetch history");

  const data: HistoryResponse = await res.json();

  if (!Array.isArray(data.sessions)) {
    return [];
  }

  return data.sessions
    .map((session) => {
      if (typeof session === "string") {
        return { id: session, title: session };
      }

      if (!session.id) {
        return null;
      }

      return {
        id: session.id,
        title: session.title?.trim() || session.id,
      };
    })
    .filter((session): session is { id: string; title: string } => Boolean(session));
}

export async function getThreadMessages(thread_id: string): Promise<Array<{ role: "user" | "assistant"; content: string }>> {
  const res = await fetch(`${BASE_URL}/chat/${encodeURIComponent(thread_id)}/messages`, { headers });
  if (!res.ok) throw new Error("Failed to fetch chat messages");

  const data: MessagesResponse = await res.json();

  if (!Array.isArray(data.messages)) {
    return [];
  }

  return data.messages
    .map((message, index) => {
      const content = message.content?.trim() || message.text?.trim() || message.message?.trim();
      if (!content) return null;

      // Backend labels all messages as "user"; alternate roles by position
      const role: "user" | "assistant" = index % 2 === 0 ? "user" : "assistant";

      return { role, content };
    })
    .filter((message): message is { role: "user" | "assistant"; content: string } => Boolean(message));
}

export async function renameChat(thread_id: string, new_title: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/chat/rename`, {
    method: "POST",
    headers,
    body: JSON.stringify({ thread_id, new_title }),
  });
  if (!res.ok) throw new Error("Failed to rename chat");
}
