import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Archive,
  Bot,
  Brain,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  Copy,
  FileText,
  Globe2,
  LayoutDashboard,
  Library,
  Menu,
  MessageSquarePlus,
  MoreHorizontal,
  Paperclip,
  Image,
  Pencil,
  Search,
  SendHorizontal,
  Settings,
  Shield,
  Sparkles,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import "./index.css";

const createChat = () => ({
  id: crypto.randomUUID(),
  title: "New Chat",
  createdAt: new Date().toISOString(),
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

const quickPrompts = [
  {
    icon: Brain,
    title: "Explain AI simply",
    subtitle: "Learn complex ideas in simple words.",
    prompt: "Explain AI simply with examples.",
  },
  {
    icon: Zap,
    title: "Help me write code",
    subtitle: "Debug, improve, and build projects.",
    prompt: "Help me write clean professional code.",
  },
  {
    icon: FileText,
    title: "Summarize my PDF",
    subtitle: "Upload documents and ask questions.",
    prompt: "Summarize my uploaded PDF in simple points.",
  },
  {
    icon: Sparkles,
    title: "Content ideas",
    subtitle: "Create reels, posts, and articles.",
    prompt: "Give me viral AI content ideas for reels.",
  },
  {
  icon: Image,
  title: "Analyze screenshot",
  subtitle: "Upload an image and ask what is shown.",
  prompt: "Analyze this screenshot and suggest improvements.",
},
];

const formatTime = (dateString) => {
  if (!dateString) return "Just now";

  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  } catch {
    return "Recent";
  }
};

const getLastMessage = (chat) => {
  return chat?.messages?.[chat.messages.length - 1]?.content || "New conversation";
};

const isEmptyNewChat = (chat) => {
  if (!chat) return false;

  const hasDefaultTitle = chat.title === "New Chat";
  const hasOnlyWelcomeMessage = chat.messages?.length === 1;
  const hasNoDocument = !chat.documentText && !chat.documentName;

  return hasDefaultTitle && hasOnlyWelcomeMessage && hasNoDocument;
};

function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">
        <Icon size={18} />
      </div>

      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <span>{hint}</span>
      </div>
    </div>
  );
}

function WelcomeDashboard({
  chats,
  activeChat,
  webSearch,
  setMessage,
  uploadedCount,
}) {
  const totalMessages = chats.reduce(
    (total, chat) => total + Math.max(chat.messages.length - 1, 0),
    0
  );

  const recentChats = chats
    .filter((chat) => chat.messages.length > 1)
    .slice(0, 3);

  return (
    <div className="dashboard-view">
      <section className="hero-card">
        <div className="hero-badge">
          <Sparkles size={15} />
          Professional Private AI Workspace
        </div>

        <h1>
          Build, research, write, and think with{" "}
          <span className="gradient-text">SamirAI</span>
        </h1>

        <p>
          Local Ollama power, web research, file reading, clean chat history,
          and a premium workspace designed for serious productivity.
        </p>

        <div className="animated-words">
          <span>Ask smarter</span>
          <span>Research faster</span>
          <span>Upload documents</span>
          <span>Create better</span>
        </div>
      </section>

      <section className="stats-grid">
        <StatCard
          icon={MessageSquarePlus}
          label="Total Chats"
          value={chats.length}
          hint="Saved locally"
        />

        <StatCard
          icon={FileText}
          label="Documents"
          value={uploadedCount}
          hint="Attached to chats"
        />

        <StatCard
          icon={Globe2}
          label="Mode"
          value={webSearch ? "Web + Local" : "Local Only"}
          hint={webSearch ? "Research enabled" : "Private mode"}
        />

        <StatCard
          icon={Bot}
          label="Messages"
          value={totalMessages}
          hint="Conversation history"
        />
      </section>

      <section className="quick-section">
        <div className="section-heading">
          <div>
            <h2>Quick Start</h2>
            <p>Choose a professional workflow and start instantly.</p>
          </div>
        </div>

        <div className="prompt-grid">
          {quickPrompts.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.title}
                className="prompt-card"
                onClick={() => setMessage(item.prompt)}
              >
                <div className="prompt-icon">
                  <Icon size={20} />
                </div>

                <strong>{item.title}</strong>
                <span>{item.subtitle}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="workspace-grid">
        <div className="workspace-card">
          <div className="section-heading compact">
            <div>
              <h2>AI Status</h2>
              <p>Your current workspace setup.</p>
            </div>
          </div>

          <div className="status-list">
            <div>
              <CheckCircle2 size={17} />
              <span>Frontend connected</span>
            </div>

            <div>
              <Shield size={17} />
              <span>Chats stored locally</span>
            </div>

            <div>
              <Globe2 size={17} />
              <span>{webSearch ? "Web search enabled" : "Local mode enabled"}</span>
            </div>

            <div>
              <Archive size={17} />
              <span>
                {activeChat?.documentName
                  ? `File active: ${activeChat.documentName}`
                  : "No active file"}
              </span>
            </div>
          </div>
        </div>

        <div className="workspace-card">
          <div className="section-heading compact">
            <div>
              <h2>Recent Work</h2>
              <p>Your latest productive chats.</p>
            </div>
          </div>

          {recentChats.length > 0 ? (
            <div className="mini-chat-list">
              {recentChats.map((chat) => (
                <div key={chat.id} className="mini-chat-item">
                  <div>
                    <strong>{chat.title}</strong>
                    <span>{getLastMessage(chat).slice(0, 80)}</span>
                  </div>

                  <small>{formatTime(chat.createdAt)}</small>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Bot size={22} />
              <p>No recent work yet. Start your first professional chat.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function App() {
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem("samirAI_chats");

    try {
      return saved ? JSON.parse(saved) : [createChat()];
    } catch {
      return [createChat()];
    }
  });

  const [activeChatId, setActiveChatId] = useState(() => {
    return localStorage.getItem("samirAI_active_chat") || null;
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [webSearch, setWebSearch] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState("");

  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  const activeChat = chats.find((chat) => chat.id === activeChatId) || chats[0];

  const uploadedCount = useMemo(() => {
    return chats.filter((chat) => chat.documentName).length;
  }, [chats]);

  const filteredChats = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return chats;

    return chats.filter((chat) => {
      const lastMessage = getLastMessage(chat);

      return (
        chat.title.toLowerCase().includes(term) ||
        lastMessage.toLowerCase().includes(term) ||
        chat.documentName?.toLowerCase().includes(term)
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

  const showToast = (text) => {
    setToast(text);
    window.clearTimeout(window.__samirAiToast);
    window.__samirAiToast = window.setTimeout(() => setToast(""), 2200);
  };

  const updateActiveChat = (updatedData) => {
    if (!activeChat) return;

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === activeChat.id ? { ...chat, ...updatedData } : chat
      )
    );
  };

  const newChat = () => {
    const existingEmptyChat = chats.find((chat) => isEmptyNewChat(chat));

    if (existingEmptyChat) {
      setActiveChatId(existingEmptyChat.id);
      showToast("You already have an empty new chat.");

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
    const shouldDelete = window.confirm("Delete this chat?");
    if (!shouldDelete) return;

    const remaining = chats.filter((chat) => chat.id !== chatId);

    if (remaining.length === 0) {
      const chat = createChat();

      setChats([chat]);
      setActiveChatId(chat.id);
      showToast("Chat deleted.");
      return;
    }

    setChats(remaining);

    if (activeChatId === chatId) {
      setActiveChatId(remaining[0].id);
    }

    showToast("Chat deleted.");
  };

  const renameChat = (chatId) => {
    const currentChat = chats.find((chat) => chat.id === chatId);
    const title = prompt("Enter chat name:", currentChat?.title || "");

    if (!title?.trim()) return;

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId ? { ...chat, title: title.trim() } : chat
      )
    );

    showToast("Chat renamed.");
  };

  const clearChat = () => {
    const shouldClear = window.confirm("Clear this chat?");
    if (!shouldClear) return;

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

    showToast("Chat cleared.");
  };

  const openChat = (chatId) => {
    setActiveChatId(chatId);

    if (window.innerWidth <= 900) {
      setSidebarOpen(false);
    }
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("Copied.");
    } catch {
      showToast("Copy failed.");
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || loading || !activeChat) return;

    const userMessage = { role: "user", content: message.trim() };
    const assistantMessage = { role: "assistant", content: "", sources: [] };

    const nextMessages = [...activeChat.messages, userMessage, assistantMessage];

    updateActiveChat({
      messages: nextMessages,
      title:
        activeChat.title === "New Chat"
          ? userMessage.content.slice(0, 42)
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

      if (!res.ok || !res.body) {
        throw new Error("Stream failed");
      }

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

          try {
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
          } catch {
            console.warn("Invalid stream event:", event);
          }
        }
      }
    } catch {
      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id !== activeChat.id) return chat;

          const withoutEmptyAssistant = chat.messages.filter(
            (_, index) => index !== chat.messages.length - 1
          );

          return {
            ...chat,
            messages: [
              ...withoutEmptyAssistant,
              {
                role: "assistant",
                content:
                  "Backend error. Make sure backend and Ollama are running, then try again.",
              },
            ],
          };
        })
      );

      showToast("Backend error.");
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  };
  const uploadImage = async (e) => {
  const file = e.target.files[0];
  if (!file || !activeChat) return;

  const formData = new FormData();
  formData.append("image", file);
  formData.append(
    "prompt",
    message.trim() ||
      "Analyze this image. Explain what it shows and give useful suggestions."
  );

  const userMessage = {
    role: "user",
    content: `Uploaded image: **${file.name}**${
      message.trim() ? `\n\nRequest: ${message.trim()}` : ""
    }`,
  };

  updateActiveChat({
    messages: [
      ...activeChat.messages,
      userMessage,
      {
        role: "assistant",
        content: "Analyzing image...",
      },
    ],
    title:
      activeChat.title === "New Chat"
        ? `Image: ${file.name}`.slice(0, 42)
        : activeChat.title,
  });

  setMessage("");
  setLoading(true);

  try {
    const res = await fetch("http://localhost:5001/api/vision", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (data.error) {
      throw new Error(data.error);
    }

    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id !== activeChat.id) return chat;

        const newMessages = [...chat.messages];

        newMessages[newMessages.length - 1] = {
          role: "assistant",
          content: data.reply || "I could not analyze this image.",
        };

        return {
          ...chat,
          messages: newMessages,
        };
      })
    );

    showToast("Image analyzed.");
  } catch {
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id !== activeChat.id) return chat;

        const newMessages = [...chat.messages];

        newMessages[newMessages.length - 1] = {
          role: "assistant",
          content:
            "Image analysis failed. Make sure `llava:7b` is installed and Ollama is running.",
        };

        return {
          ...chat,
          messages: newMessages,
        };
      })
    );

    showToast("Image analysis failed.");
  } finally {
    setLoading(false);
    e.target.value = "";
    textareaRef.current?.focus();
  }
};

  const uploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeChat) return;

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
        showToast(data.error);
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

      showToast("File uploaded.");
    } catch {
      showToast("File upload failed.");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const hasOnlyWelcome = activeChat?.messages?.length <= 1;

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <button
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {toast && <div className="toast">{toast}</div>}

      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-inner">
          <div className="brand">
            <div className="brand-icon">
              <Sparkles size={20} />
            </div>

            <div className="brand-text">
              <h1>SamirAI</h1>
              <span>Private AI workspace</span>
            </div>

            <button
              className="sidebar-close"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          </div>

          <button className="primary-btn" onClick={newChat}>
            <MessageSquarePlus size={18} />
            New Chat
          </button>

          <div className="search-wrap">
            <Search size={17} />
            <input
              className="side-search"
              placeholder="Search chats"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="section-row">
            <p className="section-label">Recent Chats</p>
            <span>{filteredChats.length}</span>
          </div>

          <div className="chat-list">
            {filteredChats.map((chat) => {
              const lastMessage = getLastMessage(chat);

              return (
                <button
                  key={chat.id}
                  className={`chat-card ${
                    chat.id === activeChat?.id ? "active" : ""
                  }`}
                  onClick={() => openChat(chat.id)}
                >
                  <div className="chat-main">
                    <div className="chat-icon">
                      <Bot size={15} />
                    </div>

                    <div className="chat-info">
                      <strong>{chat.title}</strong>
                      <span>{lastMessage.slice(0, 62)}</span>

                      <small>
                        <Clock3 size={12} />
                        {formatTime(chat.createdAt)}
                      </small>
                    </div>
                  </div>

                  <div className="chat-actions">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        renameChat(chat.id);
                      }}
                      aria-label="Rename chat"
                    >
                      <Pencil size={13} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(chat.id);
                      }}
                      aria-label="Delete chat"
                    >
                      <Trash2 size={13} />
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
            <button className="ghost-btn">
              <LayoutDashboard size={17} />
              Dashboard
            </button>

            <button className="ghost-btn">
              <Library size={17} />
              Library
            </button>

            <button className="ghost-btn">
              <Brain size={17} />
              Knowledge Base
            </button>

            <button className="ghost-btn">
              <Settings size={17} />
              Settings
            </button>

            <div className="user-card">
              <div className="avatar">S</div>

              <div>
                <strong>Samir</strong>
                <span>Administrator</span>
              </div>

              <MoreHorizontal size={18} />
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
            {sidebarOpen ? <ChevronLeft size={22} /> : <Menu size={22} />}
          </button>

          <div className="topbar-title">
            <h2>{activeChat?.title || "SamirAI"}</h2>
            <p>
              Local Ollama workspace
              {activeChat?.documentName ? ` • ${activeChat.documentName}` : ""}
            </p>
          </div>

          <div className="top-actions">
            <button
              className={`web-toggle ${webSearch ? "on" : "off"}`}
              onClick={() => setWebSearch(!webSearch)}
            >
              {webSearch ? <Globe2 size={16} /> : <Shield size={16} />}
              {webSearch ? "Web" : "Local"}
            </button>

            <label className="upload-btn">
              <Paperclip size={16} />
              Upload
              <input
                type="file"
                accept=".pdf,.txt"
                onChange={uploadFile}
                hidden
              />
            </label>
            <label className="image-btn">
  <Image size={16} />
  Image
  <input
    type="file"
    accept=".png,.jpg,.jpeg,.webp"
    onChange={uploadImage}
    hidden
  />
</label>

            <button className="clear-btn" onClick={clearChat}>
              Clear
            </button>
          </div>
        </header>

        <section className="chat-area">
          {hasOnlyWelcome && (
            <WelcomeDashboard
              chats={chats}
              activeChat={activeChat}
              webSearch={webSearch}
              setMessage={setMessage}
              uploadedCount={uploadedCount}
            />
          )}

          {!hasOnlyWelcome &&
            activeChat?.messages.map((msg, index) => (
              <div
                key={index}
                className={`message-row ${msg.role === "user" ? "user" : "ai"}`}
              >
                <div className="message-avatar">
                  {msg.role === "user" ? "S" : <Bot size={16} />}
                </div>

                <div className="message-block">
                  <div className="message-top">
                    <div className="message-name">
                      {msg.role === "user" ? "You" : "SamirAI"}
                    </div>

                    <button
                      className="copy-btn"
                      onClick={() => copyText(msg.content)}
                      aria-label="Copy message"
                    >
                      <Copy size={13} />
                    </button>
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
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message SamirAI..."
            />

            <div className="composer-actions">
              <span>Enter to send • Shift + Enter for new line</span>

              <button onClick={sendMessage} disabled={loading || !message.trim()}>
                {loading ? "…" : <SendHorizontal size={20} />}
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