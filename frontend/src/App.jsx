import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import "./index.css";

const createChat = () => ({
  id: crypto.randomUUID(),
  title: "New Chat",
  messages: [
    {
      role: "assistant",
      content:
        "Hi Samir 👋 I am **SamirAI**. Your private local AI assistant. Ask me anything.",
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
    return localStorage.getItem("samirAI_active_chat") || null;
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [webSearch, setWebSearch] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const bottomRef = useRef(null);

  const activeChat = chats.find((chat) => chat.id === activeChatId) || chats[0];

  const filteredChats = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return chats;

    return chats.filter((chat) => {
      const lastMessage =
        chat.messages?.[chat.messages.length - 1]?.content || "";
      return (
        chat.title.toLowerCase().includes(term) ||
        lastMessage.toLowerCase().includes(term)
      );
    });
  }, [chats, searchTerm]);

  useEffect(() => {
    if (!activeChatId && chats[0]) setActiveChatId(chats[0].id);
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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 900) setSidebarOpen(false);
      if (window.innerWidth > 900) setSidebarOpen(true);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const updateActiveChat = (updatedData) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === activeChat.id ? { ...chat, ...updatedData } : chat
      )
    );
  };

const isEmptyNewChat = (chat) => {
  if (!chat) return false;

  const hasDefaultTitle = chat.title === "New Chat";
  const hasOnlyWelcomeMessage = chat.messages?.length === 1;
  const hasNoDocument = !chat.documentText && !chat.documentName;

  return hasDefaultTitle && hasOnlyWelcomeMessage && hasNoDocument;
};

const newChat = () => {
  const existingEmptyChat = chats.find((chat) => isEmptyNewChat(chat));

  if (existingEmptyChat) {
    setActiveChatId(existingEmptyChat.id);

    if (window.innerWidth <= 900) {
      setSidebarOpen(false);
    }

    return;
  }

  const chat = createChat();
  setChats((prev) => [chat, ...prev]);
  setActiveChatId(chat.id);

  if (window.innerWidth <= 900) {
    setSidebarOpen(false);
  }
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
    if (activeChatId === chatId) setActiveChatId(remaining[0].id);
  };

  const renameChat = (chatId) => {
    const title = prompt("Enter chat name:");
    if (!title) return;

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId ? { ...chat, title: title.trim() } : chat
      )
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

  const openChat = (chatId) => {
    setActiveChatId(chatId);

    if (window.innerWidth <= 900) {
      setSidebarOpen(false);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    const userMessage = { role: "user", content: message.trim() };
    const assistantMessage = { role: "assistant", content: "", sources: [] };

    updateActiveChat({
      messages: [...activeChat.messages, userMessage, assistantMessage],
      title:
        activeChat.title === "New Chat"
          ? userMessage.content.slice(0, 34)
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
          webSearch,
        }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let finalReply = "";
      let buffer = "";
      let sources = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const events = buffer.split("\n\n");
        buffer = events.pop();

        for (const event of events) {
          if (!event.startsWith("data: ")) continue;

          const json = JSON.parse(event.replace("data: ", ""));

          if (json.type === "sources") {
            sources = json.sources || [];
          }

          if (json.type === "token") {
            finalReply += json.content;

            setChats((prev) =>
              prev.map((chat) => {
                if (chat.id !== activeChat.id) return chat;

                const newMessages = [...chat.messages];

                newMessages[newMessages.length - 1] = {
                  role: "assistant",
                  content: finalReply,
                  sources,
                };

                return {
                  ...chat,
                  messages: newMessages,
                };
              })
            );
          }
        }
      }
    } catch {
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
    e.target.value = "";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <button
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-inner">
          <div className="brand">
            <div className="brand-icon">S</div>

            <div className="brand-text">
              <h1>SamirAI</h1>
              <span>Private AI workspace</span>
            </div>

            <button
              className="sidebar-close"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              ✕
            </button>
          </div>

          <button className="primary-btn" onClick={newChat}>
            <span>＋</span>
            New Chat
          </button>

          <div className="search-wrap">
            <span>⌕</span>
            <input
              className="side-search"
              placeholder="Search chats"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <p className="section-label">Recent Chats</p>

          <div className="chat-list">
            {filteredChats.map((chat) => {
              const lastMessage =
                chat.messages?.[chat.messages.length - 1]?.content ||
                "New conversation";

              return (
                <button
                  key={chat.id}
                  className={`chat-card ${
                    chat.id === activeChat.id ? "active" : ""
                  }`}
                  onClick={() => openChat(chat.id)}
                >
                  <div className="chat-info">
                    <strong>{chat.title}</strong>
                    <span>{lastMessage.slice(0, 54)}...</span>
                  </div>

                  <div className="chat-actions">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        renameChat(chat.id);
                      }}
                      aria-label="Rename chat"
                    >
                      ✎
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(chat.id);
                      }}
                      aria-label="Delete chat"
                    >
                      ✕
                    </button>
                  </div>
                </button>
              );
            })}

            {filteredChats.length === 0 && (
              <div className="empty-search">No chats found.</div>
            )}
          </div>

          <div className="sidebar-bottom">
            <button className="ghost-btn">📚 Library</button>
            <button className="ghost-btn">🧠 Knowledge Base</button>
            <button className="ghost-btn">⚙️ Settings</button>

            <div className="user-card">
              <div className="avatar">S</div>
              <div>
                <strong>Samir</strong>
                <span>Administrator</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <button
            className="menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? "‹" : "☰"}
          </button>

          <div className="topbar-title">
            <h2>{activeChat?.title}</h2>
            <p>
              Local • Private • Ollama
              {activeChat?.documentName ? ` • ${activeChat.documentName}` : ""}
            </p>
          </div>

          <div className="top-actions">
            <button
              className={`web-toggle ${webSearch ? "on" : "off"}`}
              onClick={() => setWebSearch(!webSearch)}
            >
              {webSearch ? "🌐 Web" : "🔒 Local"}
            </button>

            <label className="upload-btn">
              📎 Upload
              <input
                type="file"
                accept=".pdf,.txt"
                onChange={uploadFile}
                hidden
              />
            </label>

            <button className="clear-btn" onClick={clearChat}>
              Clear
            </button>
          </div>
        </header>

        <section className="chat-area">
          {activeChat?.messages.length <= 1 && (
            <div className="welcome">
              <div className="logo-large">S</div>
              <h1>SamirAI</h1>
              <p>Your private local AI assistant.</p>

              <div className="suggestions">
                <button onClick={() => setMessage("Explain AI simply")}>
                  <strong>💡 Explain AI simply</strong>
                  <span>Learn complex ideas in simple words.</span>
                </button>

                <button onClick={() => setMessage("Help me write code")}>
                  <strong>💻 Help me write code</strong>
                  <span>Debug, build, and improve projects.</span>
                </button>

                <button onClick={() => setMessage("Summarize my PDF")}>
                  <strong>📄 Summarize my PDF</strong>
                  <span>Upload documents and ask questions.</span>
                </button>

                <button onClick={() => setMessage("Give me content ideas")}>
                  <strong>✍️ Give me content ideas</strong>
                  <span>Create reels, posts, and articles.</span>
                </button>
              </div>
            </div>
          )}

          {activeChat?.messages.map((msg, index) => (
            <div
              key={index}
              className={`message-row ${msg.role === "user" ? "user" : "ai"}`}
            >
              <div className="message-avatar">
                {msg.role === "user" ? "S" : "AI"}
              </div>

              <div className="message-block">
                <div className="message-name">
                  {msg.role === "user" ? "You" : "SamirAI"}
                </div>

                <div className="message-bubble">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>

                  {msg.sources?.length > 0 && (
                    <div className="sources-box">
                      <p>Sources</p>

                      {msg.sources.map((source) => (
                        <a
                          key={source.id}
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="source-link"
                        >
                          [{source.id}] {source.title}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="typing-pill">
              <span></span>
              <span></span>
              <span></span>
              SamirAI is thinking
            </div>
          )}

          <div ref={bottomRef} />
        </section>

        <footer className="composer-wrap">
          <div className="composer">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message SamirAI..."
            />

            <div className="composer-actions">
              <span>Enter to send • Shift + Enter for new line</span>
              <button onClick={sendMessage} disabled={loading}>
                {loading ? "…" : "➜"}
              </button>
            </div>
          </div>

          <p className="disclaimer">
            SamirAI can make mistakes. Verify important information.
          </p>
        </footer>
      </main>
    </div>
  );
}