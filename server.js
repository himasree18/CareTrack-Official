// server.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// OpenAI configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// API endpoint to fetch medicine info
app.post("/medicine-info", async (req, res) => {
  const { medicine } = req.body;

  if (!medicine) {
    return res.status(400).json({ error: "Medicine name is required" });
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

