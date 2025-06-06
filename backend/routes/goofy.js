// backend/routes/goofy.js
const express = require("express");
const OpenAI  = require("openai");
const router  = express.Router();

/**
 * POST /api/goofy-edit
 * Body: { variation_b64, mask_b64, prompt, n?, size?, model? }
 * Returns: { b64 }  (base-64 PNG of edited image)
 */
router.post("/goofy-edit", async (req, res) => {
  const {
    variation_b64,
    mask_b64,
    prompt,
    n    = 1,
    size = "1024x1024",
    model = "dall-e-2"          // change to "dall-e-3" if you have access
  } = req.body;

  if (!variation_b64 || !mask_b64 || !prompt) {
    return res
      .status(400)
      .json({ error: "variation_b64, mask_b64 and prompt are required" });
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Convert the base-64 strings into File objects (Node 18+ has global File/Blob)
    const imageFile = await openai.toFile(
      Buffer.from(variation_b64, "base64"),
      "variation.png"
    );
    const maskFile  = await openai.toFile(
      Buffer.from(mask_b64, "base64"),
      "mask.png"
    );

    // Call OpenAI’s image edit endpoint
    const edit = await openai.images.edit({
      model,
      image: imageFile,
      mask:  maskFile,
      prompt,
      n,
      size,
      response_format: "b64_json"
    });

    return res.json({ b64: edit.data[0].b64_json });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ error: err.message, detail: err.response?.data });
  }
});

module.exports = router;
