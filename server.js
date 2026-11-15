// server.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables from .env file
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Serve the frontend pages from the same server (so API calls use relative URLs)
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "welcome.html")));
const PUBLIC_FILES = /^\/(?:[\w-]+\.html|reminder-alarm\.js|alarm\.mp3)$/;
const serveStatic = express.static(__dirname, { dotfiles: "deny", index: false });
app.use((req, res, next) => (PUBLIC_FILES.test(req.path) ? serveStatic(req, res, next) : next()));

// OpenAI configuration
// The key is optional: without it the app still runs, only Medicine Info is disabled.
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// API endpoint to fetch medicine info
app.post("/medicine-info", async (req, res) => {
  const { medicine } = req.body;

  if (!medicine) {
    return res.status(400).json({ error: "Medicine name is required" });
  }

  if (!openai) {
    return res.status(503).json({
      error: "Medicine info is unavailable: OPENAI_API_KEY is not set in the .env file.",
    });
  }

  try {
    const prompt = `
    Provide detailed information about the medicine "${medicine}". 
    Include what it's used for, how it works, dosage, side effects, and precautions. Use simple language.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
    });

    const result = completion.choices?.[0]?.message?.content;

    res.json({ info: result || "No information found. Try a different medicine." });
  } catch (error) {
    console.error("Error fetching from OpenAI:", error);
    res.status(500).json({ error: "Something went wrong while fetching medicine info." });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});

