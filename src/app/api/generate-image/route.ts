import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/generate-image
 * Generate an AI product image using Google Gemini.
 * Supports three domains: wine (default), ticket, property.
 *
 * Body: { domain?: 'wine' | 'ticket' | 'property', ...metadata }
 * Returns: { success: true, imageUrl: string, imageBase64: string, prompt: string }
 */
export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not configured. Get one at https://aistudio.google.com/apikey" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const domain = body.domain || "wine";

    let prompt: string;
    let aspectRatio = "3:4"; // portrait default

    switch (domain) {
      case "ticket":
        prompt = buildTicketImagePrompt(body);
        aspectRatio = "16:9"; // landscape for event posters
        break;
      case "property":
        prompt = buildPropertyImagePrompt(body);
        aspectRatio = "16:9"; // landscape for real estate
        break;
      default:
        prompt = buildWineImagePrompt(body);
        aspectRatio = "3:4"; // portrait for wine bottles
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: prompt,
      config: {
        responseModalities: ["TEXT", "IMAGE"],
        imageConfig: {
          aspectRatio: aspectRatio as any,
          imageSize: "1K",
        },
      },
    });

    // Extract image from response
    let imageBase64 = "";
    let mimeType = "image/png";

    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        imageBase64 = part.inlineData.data;
        mimeType = part.inlineData.mimeType || "image/png";
        break;
      }
    }

    if (!imageBase64) {
      return NextResponse.json(
        { error: "No image returned from Gemini. Try adjusting the description." },
        { status: 500 }
      );
    }

    const imageUrl = `data:${mimeType};base64,${imageBase64}`;

    return NextResponse.json({
      success: true,
      imageUrl,
      imageBase64,
      mimeType,
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

// ── Wine Image Prompt ──
function buildWineImagePrompt(data: Record<string, any>): string {
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

  return [
    `Professional wine product photography of "${name}"${vintage ? ` ${vintage}` : ""}${producer ? ` by ${producer}` : ""}.`,
    `Elegant wine bottle with premium label design, ${colorPalette}.`,
    region ? `Vineyard landscape of ${region}${country ? `, ${country}` : ""} subtly in background.` : "",
    varietal ? `${varietal} grape variety.` : "",
    nose ? `Aromatic elements suggesting ${nose}.` : "",
    `Studio-quality lighting, shallow depth of field, luxury product photography, editorial wine magazine style.`,
    `Dark elegant background, photorealistic.`,
  ].filter(Boolean).join(" ");
}

// ── Ticket / Event Image Prompt ──
function buildTicketImagePrompt(data: Record<string, any>): string {
  const eventName = data.eventName || "Live Event";
  const category = data.category || "concert";
  const venueName = data.venueName || "";
  const tier = data.tier || "general";
  const description = data.description || "";

  const categoryVisuals: Record<string, string> = {
    concert: "electric concert stage with dramatic laser lights, neon beams cutting through fog, massive LED screens, screaming crowd, pyrotechnics",
    sports: "packed stadium under floodlights, athletes in motion, roaring crowd, dynamic action shot, high-energy atmosphere",
    theater: "grand theatrical stage with velvet curtains, dramatic spotlighting, ornate proscenium arch, elegant auditorium",
    conference: "futuristic conference stage with holographic displays, sleek modern design, tech keynote atmosphere, LED panels",
    festival: "massive outdoor music festival at sunset, multiple stages, colorful lights, sea of people, vibrant atmosphere, fireworks",
  };

  const tierVisuals: Record<string, string> = {
    general: "vibrant crowd energy, immersive experience",
    vip: "exclusive VIP lounge, premium viewing area, velvet ropes, champagne service",
    backstage: "backstage pass atmosphere, behind-the-scenes access, artist area, intimate exclusive",
    premium: "front-row premium seats, unobstructed view, luxury amenities",
  };

  const visual = categoryVisuals[category] || categoryVisuals.concert;
  const tierVibe = tierVisuals[tier] || tierVisuals.general;

  return [
    `Epic cinematic event poster for "${eventName}".`,
    `${visual}.`,
    venueName ? `Set at ${venueName}.` : "",
    `${tierVibe}.`,
    description ? `Atmosphere: ${description.slice(0, 100)}.` : "",
    `Cyberpunk aesthetic with neon cyan (#00f0ff) and magenta (#ff2d78) color palette.`,
    `Ultra-wide cinematic composition, dramatic lighting, volumetric fog, lens flares.`,
    `Professional event promotional artwork, 4K quality, hyper-detailed, photorealistic.`,
  ].filter(Boolean).join(" ");
}

// ── Property / Real Estate Image Prompt ──
function buildPropertyImagePrompt(data: Record<string, any>): string {
  const name = data.name || "Luxury Property";
  const city = data.city || "";
  const country = data.country || "";
  const propertyType = data.propertyType || "residential";
  const description = data.description || "";
  const yearBuilt = data.yearBuilt || "";

  const typeVisuals: Record<string, string> = {
    residential: "luxury residential building, modern architecture, floor-to-ceiling windows, landscaped gardens, infinity pool",
    commercial: "prestigious commercial tower, glass and steel facade, grand lobby entrance, city skyline backdrop",
    "mixed-use": "stunning mixed-use development, retail podium with residential tower, vibrant street-level shops, modern urban design",
    hospitality: "five-star hotel resort, grand entrance with water features, tropical landscaping, luxury spa atmosphere",
  };

  const visual = typeVisuals[propertyType] || typeVisuals.residential;
  const location = [city, country].filter(Boolean).join(", ");
  const isModern = yearBuilt && parseInt(yearBuilt) > 2010;

  return [
    `Award-winning architectural photography of "${name}".`,
    `${visual}.`,
    location ? `Located in ${location}.` : "",
    isModern
      ? "Contemporary architectural design, clean lines, sustainable materials."
      : "Timeless elegant architecture, classic proportions, premium materials.",
    description ? `Features: ${description.slice(0, 100)}.` : "",
    `Golden hour lighting with warm champagne tones and deep navy sky.`,
    `Shot with a tilt-shift lens, luxury real estate magazine style.`,
    `Ultra-high quality architectural photography, 4K, photorealistic, editorial quality.`,
  ].filter(Boolean).join(" ");
}
