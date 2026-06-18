import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

const createChat = () => ({
  id: crypto.randomUUID(),
  title: "New Chat",
  messages: [
    {
      role: "assistant",
      content: "Hi Samir 👋 I am SamirAI. Your private local AI assistant.",
    },
  ],
  documentText: "",
  documentName: "",
});

export default function App() {
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem("samirAI_chats");
    return saved ? JSON.parse(saved) : [createChat()];
  });

  const [activeChatId, setActiveChatId] = useState(() => {
    const saved = localStorage.getItem("samirAI_active_chat");
    return saved || null;
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const activeChat = chats.find((chat) => chat.id === activeChatId) || chats[0];

  useEffect(() => {
    if (!activeChatId && chats[0]) {
      setActiveChatId(chats[0].id);
    }
  }, [chats, activeChatId]);

  useEffect(() => {
    localStorage.setItem("samirAI_chats", JSON.stringify(chats));
    if (activeChat?.id) {
      localStorage.setItem("samirAI_active_chat", activeChat.id);
    }
  }, [chats, activeChat]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages, loading]);

  const updateActiveChat = (updatedData) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === activeChat.id ? { ...chat, ...updatedData } : chat
      )
    );
  };

  const newChat = () => {
    const chat = createChat();
    setChats((prev) => [chat, ...prev]);
    setActiveChatId(chat.id);
  };

  const deleteChat = (chatId) => {
    const remaining = chats.filter((chat) => chat.id !== chatId);

    if (remaining.length === 0) {
      const chat = createChat();
      setChats([chat]);
      setActiveChatId(chat.id);
      return;
    }

    setChats(remaining);

    if (activeChatId === chatId) {
      setActiveChatId(remaining[0].id);
    }
  };

  const renameChat = (chatId) => {
    const title = prompt("Enter chat name:");
    if (!title) return;

    setChats((prev) =>
      prev.map((chat) => (chat.id === chatId ? { ...chat, title } : chat))
    );
  };

  const clearChat = () => {
    updateActiveChat({
      messages: [
        {
          role: "assistant",
          content: "Chat cleared. How can I help you now?",
        },
      ],
      documentText: "",
      documentName: "",
    });
  };

  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    const userMessage = {
      role: "user",
      content: message,
    };

    const assistantMessage = {
      role: "assistant",
      content: "",
    };

    const updatedMessages = [
      ...activeChat.messages,
      userMessage,
      assistantMessage,
    ];

    updateActiveChat({
      messages: updatedMessages,
      title:
        activeChat.title === "New Chat"
          ? userMessage.content.slice(0, 28)
          : activeChat.title,
    });

    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5001/api/chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...activeChat.messages, userMessage],
          documentText: activeChat.documentText,
        }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let finalReply = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value);
        finalReply += chunk;

        setChats((prev) =>
          prev.map((chat) => {
            if (chat.id !== activeChat.id) return chat;

            const newMessages = [...chat.messages];
            newMessages[newMessages.length - 1] = {
              role: "assistant",
              content: finalReply,
            };

            return {
              ...chat,
              messages: newMessages,
            };
          })
        );
      }
    } catch (error) {
      updateActiveChat({
        messages: [
          ...activeChat.messages,
          userMessage,
          {
            role: "assistant",
            content: "Backend error. Make sure backend and Ollama are running.",
          },
        ],
      });
    }

    setLoading(false);
  };

  const uploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5001/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.error) {
        alert(data.error);
        setLoading(false);
        return;
      }

      updateActiveChat({
        documentText: data.text,
        documentName: file.name,
        messages: [
          ...activeChat.messages,
          {
            role: "assistant",
            content: `I have read your file: **${file.name}**. Now ask me questions about it.`,
          },
        ],
      });
    } catch {
      alert("File upload failed.");
    }

    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <h2 style={styles.logo}>🤖 SamirAI</h2>

        <button onClick={newChat} style={styles.newButton}>
          + New Chat
        </button>

        <div style={styles.chatList}>
          {chats.map((chat) => (
            <div
              key={chat.id}
              style={{
                ...styles.chatItem,
                background:
                  chat.id === activeChat.id
                    ? "rgba(37,99,235,0.35)"
                    : "rgba(255,255,255,0.05)",
              }}
              onClick={() => setActiveChatId(chat.id)}
            >
              <span style={styles.chatTitle}>{chat.title}</span>

              <div style={styles.chatActions}>
                <button onClick={(e) => { e.stopPropagation(); renameChat(chat.id); }}>
                  ✏️
                </button>
                <button onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }}>
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main style={styles.chatBox}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>{activeChat?.title}</h1>
            <p style={styles.subtitle}>
              Private local AI running with Ollama
              {activeChat?.documentName
                ? ` • File: ${activeChat.documentName}`
                : ""}
            </p>
          </div>

          <div style={styles.headerActions}>
            <label style={styles.uploadButton}>
              Upload PDF/TXT
              <input
                type="file"
                accept=".pdf,.txt"
                onChange={uploadFile}
                style={{ display: "none" }}
              />
            </label>

            <button onClick={clearChat} style={styles.clearButton}>
              Clear
            </button>
          </div>
        </header>

        <section style={styles.messages}>
          {activeChat?.messages.map((msg, index) => (
            <div
              key={index}
              style={{
                ...styles.messageRow,
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  ...styles.bubble,
                  ...(msg.role === "user" ? styles.userBubble : styles.aiBubble),
                }}
              >
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          ))}

          {loading && (
            <div style={styles.typing}>
              SamirAI is typing...
            </div>
          )}

          <div ref={bottomRef} />
        </section>

        <footer style={styles.inputArea}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask SamirAI..."
            style={styles.textarea}
          />

          <button onClick={sendMessage} style={styles.sendButton}>
            Send
          </button>
        </footer>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    background: "#020617",
    color: "white",
  },
  sidebar: {
    width: "280px",
    padding: "16px",
    borderRight: "1px solid rgba(255,255,255,0.12)",
    background: "#0f172a",
  },
  logo: {
    marginTop: 0,
  },
  newButton: {
    width: "100%",
    padding: "13px",
    borderRadius: "14px",
    border: "none",
    background: "#22c55e",
    fontWeight: "bold",
    cursor: "pointer",
  },
  chatList: {
    marginTop: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  chatItem: {
    padding: "12px",
    borderRadius: "14px",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    gap: "8px",
  },
  chatTitle: {
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  },
  chatActions: {
    display: "flex",
    gap: "4px",
  },
  chatBox: {
    flex: 1,
    height: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    padding: "16px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
  },
  title: {
    margin: 0,
  },
  subtitle: {
    margin: "5px 0 0",
    color: "#94a3b8",
    fontSize: "14px",
  },
  headerActions: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  uploadButton: {
    background: "#2563eb",
    color: "white",
    padding: "10px 14px",
    borderRadius: "999px",
    cursor: "pointer",
    fontSize: "14px",
  },
  clearButton: {
    background: "rgba(255,255,255,0.08)",
    color: "white",
    border: "1px solid rgba(255,255,255,0.2)",
    padding: "10px 14px",
    borderRadius: "999px",
    cursor: "pointer",
  },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: "20px",
  },
  messageRow: {
    display: "flex",
    marginBottom: "14px",
  },
  bubble: {
    maxWidth: "78%",
    padding: "14px 16px",
    borderRadius: "18px",
    lineHeight: "1.6",
    whiteSpace: "pre-wrap",
  },
  userBubble: {
    background: "#2563eb",
    color: "white",
    borderBottomRightRadius: "4px",
  },
  aiBubble: {
    background: "#1e293b",
    color: "#e5e7eb",
    borderBottomLeftRadius: "4px",
  },
  typing: {
    color: "#94a3b8",
    fontStyle: "italic",
  },
  inputArea: {
    display: "flex",
    gap: "10px",
    padding: "14px",
    borderTop: "1px solid rgba(255,255,255,0.1)",
  },
  textarea: {
    flex: 1,
    height: "54px",
    borderRadius: "14px",
    border: "none",
    padding: "14px",
    fontSize: "16px",
    resize: "none",
  },
  sendButton: {
    border: "none",
    borderRadius: "14px",
    padding: "0 22px",
    background: "#22c55e",
    fontWeight: "bold",
    cursor: "pointer",
  },
};