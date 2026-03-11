const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI("AIzaSyBaFN9BjoxE436EM6cc9XDDcjQlgILExhw");

app.post("/api/chat", async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const { system, messages } = req.body;

    // Build conversation history
    const history = messages.slice(0, -1).map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));

    const lastMessage = messages[messages.length - 1].content;

    const chat = model.startChat({
      history,
      systemInstruction: system
    });

    const result = await chat.sendMessage(lastMessage);
    const text = result.response.text();

    console.log("✅ Gemini Response:", text);

    res.json({
      content: [{ type: "text", text }]
    });

  } catch (err) {
    console.error("❌ Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => console.log("✅ Server running on port 3001"));