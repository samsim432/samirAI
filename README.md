# 🤖 SamirAI

Private Local AI Assistant powered by Ollama.

SamirAI is a privacy-first AI workspace that runs local AI models on your own computer. It supports multi-chat conversations, web research, document analysis, image understanding, and real-time AI responses.

---

## ✨ Features

* 🧠 Local AI with Ollama
* 💬 Multi Chat Conversations
* ⚡ Streaming Responses
* 📄 PDF & TXT Analysis
* 🖼️ Image Understanding
* 🌐 Web Research
* 📝 Markdown Rendering
* 🔒 Privacy First
* 💾 Local Chat Storage
* 🚀 Modern UI
* 🌐 Open Source

---

## 🛠️ Tech Stack

* React + Vite
* Node.js + Express
* Ollama
* Qwen 2.5
* Multer
* React Markdown

---

## 💻 System Requirements

### Minimum

* 8 GB RAM
* Modern CPU
* 10 GB Free Storage
* Node.js 20+

### Recommended

* 16 GB+ RAM
* Apple Silicon (M1/M2/M3/M4) or Modern AMD/Intel CPU
* 20 GB+ Free Storage

---

## 📦 Installation

### 1. Clone Repository

```bash
git clone https://github.com/samsim432/samirAI.git
cd samirAI
```

### 2. Install Ollama

Download and install Ollama:

https://ollama.com

### 3. Download AI Model

```bash
ollama pull qwen2.5:7b
```

---

## 🚀 Start Backend

```bash
cd backend
npm install
npm start
```

Backend runs on:

```text
http://localhost:5001
```

---

## 🚀 Start Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

## 📖 Usage

1. Start Ollama
2. Start Backend
3. Start Frontend
4. Open http://localhost:5173
5. Start chatting with SamirAI

---

## 🧠 Supported Features

* Ask AI questions
* Explain complex topics
* Generate content ideas
* Analyze PDFs
* Analyze Images
* Web Research
* Multiple Chat Sessions
* Local Chat History

---

## 🔒 Privacy

SamirAI runs local AI models through Ollama.

Your conversations stay on your machine unless you explicitly enable web search.

---

## 🐛 Troubleshooting

### Ollama Not Found

Install Ollama:

https://ollama.com

### Model Missing

```bash
ollama pull qwen2.5:7b
```

### Check Ollama

```bash
ollama list
```

### Check Node.js

```bash
node -v
npm -v
```

---

## 📄 License

MIT License

---

Built with ❤️ by Samir Simkhada.
