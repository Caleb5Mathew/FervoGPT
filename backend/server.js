// backend/server.js
require("dotenv").config();

const express = require("express");
const goofyRouter = require("./routes/goofy");   // ⭐ NEW: import the router

const cors    = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { OpenAI } = require("openai");

const app  = express();

/* ────────────────────────────────────────────────
   1)  PORT  ― use 8000 in Render (or whatever you
       set in Docker / Render env) and fall back to
       5000 locally.
   ────────────────────────────────────────────────*/
const port = process.env.PORT || 8000;

/* ────────────────────────────────────────────────
   2)  CORS  ― allow your deployed frontend OR
       localhost during dev, driven by env var.
   ────────────────────────────────────────────────*/
app.use(
  cors({
    origin:
      process.env.FRONTEND_ORIGIN || "http://localhost:3000",
  })
);

app.use(express.json({ limit: "15mb" }));
app.use("/api", goofyRouter);                    // ⭐ NEW: route is /api/goofy-edit

/* ────────────────────────────────────────────────
   3)  /ask proxy  ― no more hard-coded localhost.
       Instead, read ASK_API_URL from the env.
       Keeps localhost:5001 for dev; switches to
       your Render URL in prod.
   ────────────────────────────────────────────────*/
const askApiTarget =
  process.env.ASK_API_URL || "http://127.0.0.1:5001";

app.use(
  "/ask",
  createProxyMiddleware({
    target: askApiTarget,
    changeOrigin: true,
  })
);

/* ────────────────────────────────────────────────
   Rest of the file unchanged
   ────────────────────────────────────────────────*/
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/api/goofy-edit", async (req, res) => {
  const { variation_b64, mask_b64, prompt, n = 1, size = "1024x1024" } =
    req.body;
  if (!variation_b64 || !mask_b64 || !prompt)
    return res
      .status(400)
      .json({ error: "variation_b64, mask_b64 and prompt are required" });

  try {
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

    return res.json({ b64: edit.data[0].b64_json });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ error: err.message, details: err.response?.data });
  }
});

app.listen(port, () =>
  console.log(`API listening on http://localhost:${port}`)
);
