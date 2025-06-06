// pages/api/goofy-edit.js
import OpenAI from 'openai';

export default async function handler(req, res) {
  console.log("🔍 /api/goofy-edit handler invoked");   // ①

  if (req.method !== 'POST') {
    console.log("⛔ Wrong HTTP method:", req.method);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // ------------------------------------------------------------------ parse
    const {
      variation_b64,
      mask_b64,
      prompt,
      n    = 1,
      size = '1024x1024',
      model = 'dall-e-2',        // change to 'dall-e-3' here if enabled
    } = req.body;

    console.log("📥 Parsed body:", {
      variationDefined: !!variation_b64,
      maskDefined:      !!mask_b64,
      promptLength:     prompt?.length || 0,
      n,
      size,
      model,
    });                                                  // ②

    if (!variation_b64 || !mask_b64 || !prompt) {
      console.warn("⚠️ Missing one or more required fields");
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // -------------------------------------------------------------- diagnostics
    console.log('🛠  /api/goofy-edit parameters:', {
      model,
      promptLength: prompt.length,
      n,
      size,
      variationBytes: Buffer.byteLength(variation_b64, 'base64'),
      maskBytes:      Buffer.byteLength(mask_b64,      'base64'),
    });                                                  // ③

    // ------------------------------------------------------------------ setup
    if (!process.env.OPENAI_API_KEY) {
      console.error("❌ OPENAI_API_KEY is not set in environment");
      return res.status(500).json({ error: 'Server misconfiguration: missing API key' });
    }
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    console.log("🚀 Converted OpenAI client ready");

    // Convert base-64 → File objects (Node 18+ has global File/Blob)
    console.log("📄 Converting variation and mask to File objects…");
    const imageFile = await openai.toFile(
      Buffer.from(variation_b64, 'base64'),
      'variation.png',
    );
    const maskFile = await openai.toFile(
      Buffer.from(mask_b64, 'base64'),
      'mask.png',
    );
    console.log("📄 Conversion complete, calling OpenAI.images.edit");

    // ------------------------------------------------------------- API request
    const edit = await openai.images.edit({
      model,
      image: imageFile,
      mask:  maskFile,
      prompt,
      n,
      size,
      response_format: 'b64_json',
    });

    console.log('✅ OpenAI.images.edit succeeded, sending response back');  // ④
    return res.status(200).json({ b64: edit.data[0].b64_json });
  } catch (err) {
    // ------------------------------------------------------------- rich errors
    const detail = err?.error ?? err;
    console.error('❌ edit failed:', detail);                              // ⑤
    return res
      .status(err.statusCode || 500)
      .json({
        error: err.message || 'Internal error',
        detail,                         // full OpenAI payload if present
      });
  }
}
