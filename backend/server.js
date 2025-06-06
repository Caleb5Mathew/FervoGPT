// backend/server.js
require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { OpenAI } = require("openai");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json({ limit: "15mb" }));

app.use(
  "/ask",
  createProxyMiddleware({
    target: "http://127.0.0.1:5001",
    changeOrigin: true,
  })
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
app.post("/api/goofy-edit", async (req, res) => {
  console.log("--- /api/goofy-edit received request: ---");
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);

  const { variation_b64, mask_b64, prompt, n = 1, size = "1024x1024" } = req.body;
  if (!variation_b64 || !mask_b64 || !prompt) {
    console.log("Missing one of variation_b64, mask_b64, or prompt → returning 400");
    return res.status(400).json({ error: "variation_b64, mask_b64 and prompt are required" });
  }

  try {
    console.log("Calling OpenAI.images.edit...");
    const imageBuffer = Buffer.from(variation_b64, "base64");
    const maskBuffer  = Buffer.from(mask_b64,      "base64");

    const edit = await openai.images.edit({
      model: "dall-e-2",
      image: imageBuffer,
      mask:  maskBuffer,
      prompt,
      n,
      size,
      response_format: "b64_json",
    });

    console.log("OpenAI responded; sending result back to client.");
    return res.json({ b64: edit.data[0].b64_json });
  } catch (err) {
    console.error("[/api/goofy-edit] error calling OpenAI:", err);
    return res.status(err.statusCode || 500).json({
      error:   err.message,
      details: err.response?.data,
    });
  }
});

app.listen(port, () => {
  console.log(`Express listening on http://localhost:${port}`);
});
