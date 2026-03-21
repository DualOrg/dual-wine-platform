import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const MODEL = "gemini-2.5-flash-image";

/**
 * POST /api/generate-image
 * Generate an AI image from wine metadata using Gemini Nano Banana.
 *
 * Body: { name, producer, region, country, vintage, varietal, type, description,
 *         nose, palate, finish }
 *
 * Returns: { success: true, imageUrl: string, prompt: string }
 */
export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not configured. Add it to your environment variables." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const prompt = buildImagePrompt(body);

    const url = `${GEMINI_BASE}/${MODEL}:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"],
          imageConfig: {
            aspectRatio: "3:4",   // Portrait — works well for wine bottles
            imageSize: "1K",
          },
        },
      }),
    });

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text();
      console.error("Gemini API error:", geminiRes.status, errBody);
      return NextResponse.json(
        { error: `Gemini API error (${geminiRes.status}): ${errBody.slice(0, 200)}` },
        { status: geminiRes.status }
      );
    }

    const geminiData = await geminiRes.json();

    // Extract image from response
    const candidates = geminiData.candidates || [];
    let imageBase64 = "";
    let mimeType = "image/png";

    for (const candidate of candidates) {
      const parts = candidate.content?.parts || [];
      for (const part of parts) {
        if (part.inline_data?.data) {
          imageBase64 = part.inline_data.data;
          mimeType = part.inline_data.mime_type || "image/png";
          break;
        }
      }
      if (imageBase64) break;
    }

    if (!imageBase64) {
      return NextResponse.json(
        { error: "No image returned from Gemini. Try a different description." },
        { status: 500 }
      );
    }

    // Save to public/uploads/
    const ext = mimeType.includes("jpeg") ? "jpg" : "png";
    const filename = `ai-wine-${randomUUID().slice(0, 8)}.${ext}`;
    const publicDir = join(process.cwd(), "public", "uploads");
    await mkdir(publicDir, { recursive: true });
    const filepath = join(publicDir, filename);

    const buffer = Buffer.from(imageBase64, "base64");
    await writeFile(filepath, buffer);

    const imageUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      imageUrl,
      prompt,
    });
  } catch (err: any) {
    console.error("Image generation error:", err);
    return NextResponse.json(
      { error: err.message || "Image generation failed" },
      { status: 500 }
    );
  }
}

/**
 * Builds a product-photography-style prompt from wine metadata.
 */
function buildImagePrompt(data: Record<string, any>): string {
  const name = data.name || "Fine Wine";
  const producer = data.producer || "";
  const region = data.region || "";
  const country = data.country || "";
  const vintage = data.vintage || "";
  const varietal = data.varietal || "";
  const type = data.type || "red";
  const nose = data.nose || "";

  const colorMap: Record<string, string> = {
    red: "deep ruby red wine in glass, dark moody lighting, burgundy tones",
    white: "pale golden white wine in crystal glass, bright natural light, straw tones",
    sparkling: "champagne with fine bubbles in flute glass, celebratory golden light",
    "rosé": "delicate salmon-pink rosé in stemmed glass, soft sunset lighting",
    dessert: "rich amber dessert wine, warm honey-gold tones, candlelight",
    fortified: "deep mahogany port wine in small glass, vintage cellar atmosphere",
  };

  const colorPalette = colorMap[type] || colorMap.red;

  const parts = [
    `Professional wine product photography of "${name}"${vintage ? ` ${vintage}` : ""}${producer ? ` by ${producer}` : ""}.`,
    `Elegant wine bottle with premium label design, ${colorPalette}.`,
    region ? `Vineyard landscape of ${region}${country ? `, ${country}` : ""} subtly in background.` : "",
    varietal ? `${varietal} grape variety.` : "",
    nose ? `Aromatic elements suggesting ${nose}.` : "",
    `Studio-quality lighting, shallow depth of field, luxury product photography, clean composition, editorial wine magazine style.`,
    `Dark elegant background, no text overlays, photorealistic.`,
  ].filter(Boolean);

  return parts.join(" ");
}
