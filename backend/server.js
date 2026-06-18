import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";
import PDFParser from "pdf2json";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json({ limit: "20mb" }));

const PORT = process.env.PORT || 5001;
const MODEL = process.env.OLLAMA_MODEL || "qwen2.5:7b";

const upload = multer({
  dest: "uploads/",
});

function readPDF(filePath) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on("pdfParser_dataError", (errData) => {
      reject(errData.parserError);
    });

    pdfParser.on("pdfParser_dataReady", (pdfData) => {
      let text = "";

      pdfData.Pages.forEach((page) => {
        page.Texts.forEach((textItem) => {
          textItem.R.forEach((r) => {
            text += decodeURIComponent(r.T) + " ";
          });
        });
      });

      resolve(text);
    });

    pdfParser.loadPDF(filePath);
  });
}

app.get("/", (req, res) => {
  res.json({
    message: "SamirAI backend is running",
    model: MODEL,
  });
});

app.post("/api/chat/stream", async (req, res) => {
  try {
    const { messages, documentText } = req.body;

    const history = messages
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join("\n");

    const prompt = `
You are SamirAI, a private local AI assistant created by Samir Simkhada.

Rules:
- Always say you are SamirAI.
- Never say you are Qwen, Llama, Gemma, or Alibaba AI.
- You run locally using Ollama.
- Be clear, helpful, and beginner-friendly.

${
  documentText
    ? `
The user uploaded this document. Use it when answering questions:

${documentText}
`
    : ""
}

Conversation:
${history}

assistant:
`;

    const ollamaRes = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        prompt,
        stream: true,
      }),
    });

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");

    const reader = ollamaRes.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n").filter(Boolean);

      for (const line of lines) {
        try {
          const json = JSON.parse(line);

          if (json.response) {
            res.write(json.response);
          }
        } catch {
          // Ignore broken stream line
        }
      }
    }

    res.end();
  } catch (error) {
    res.status(500).send("SamirAI backend error: " + error.message);
  }
});

app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        error: "No file uploaded",
      });
    }

    let text = "";

    if (file.mimetype === "text/plain") {
      text = fs.readFileSync(file.path, "utf8");
    } else if (file.mimetype === "application/pdf") {
      text = await readPDF(file.path);
    } else {
      fs.unlinkSync(file.path);

      return res.status(400).json({
        error: "Only PDF and TXT files are supported",
      });
    }

    fs.unlinkSync(file.path);

    res.json({
      text,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`SamirAI backend running on http://localhost:${PORT}`);
});