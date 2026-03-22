import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 min — Veo can take up to 6 min

/**
 * POST /api/generate-video
 * Generate an AI video using Google Gemini Veo.
 * Supports three domains: wine (default), ticket, property.
 *
 * Body: { domain?: 'wine' | 'ticket' | 'property', imageBase64?, imageMimeType?, ...metadata }
 * Returns: { success: true, videoUrl: string, prompt: string }
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
    const imageBase64 = body.imageBase64;
    const imageMimeType = body.imageMimeType || "image/png";

    let prompt: string;
    switch (domain) {
      case "ticket":
        prompt = buildTicketVideoPrompt(body);
        break;
      case "property":
        prompt = buildPropertyVideoPrompt(body);
        break;
      default:
        prompt = buildWineVideoPrompt(body);
    }

    const ai = new GoogleGenAI({ apiKey });

    const generateParams: any = {
      model: "veo-3.1-generate-preview",
      prompt,
      config: {
        aspectRatio: "16:9",
        numberOfVideos: 1,
      },
    };

    // If we have an AI-generated image, use image-to-video
    if (imageBase64) {
      generateParams.image = {
        imageBytes: imageBase64,
        mimeType: imageMimeType,
      };
    }

    // Submit generation (returns a long-running operation)
    let operation = await ai.models.generateVideos(generateParams);

    // Poll until done (every 10s, up to ~5 min)
    const maxPolls = 30;
    for (let i = 0; i < maxPolls && !operation.done; i++) {
      await new Promise((r) => setTimeout(r, 10000));
      operation = await ai.operations.getVideosOperation({ operation });
    }

    if (!operation.done) {
      return NextResponse.json(
        { error: "Video generation timed out. Please try again." },
        { status: 504 }
      );
    }

    const generatedVideos = operation.response?.generatedVideos || [];
    if (generatedVideos.length === 0) {
      return NextResponse.json(
        { error: "No video returned from Gemini Veo. Try a different description." },
        { status: 500 }
      );
    }

    const videoFile = generatedVideos[0].video;

    let videoBase64 = "";
    if (videoFile?.uri) {
      const dlUrl = videoFile.uri.includes("?")
        ? `${videoFile.uri}&key=${apiKey}`
        : `${videoFile.uri}?key=${apiKey}`;
      const dlRes = await fetch(dlUrl);
      if (!dlRes.ok) {
        return NextResponse.json(
          { error: `Failed to download video: ${dlRes.status}` },
          { status: 500 }
        );
      }
      const buffer = Buffer.from(await dlRes.arrayBuffer());
      videoBase64 = buffer.toString("base64");
    } else if (videoFile?.videoBytes) {
      videoBase64 = typeof videoFile.videoBytes === "string"
        ? videoFile.videoBytes
        : Buffer.from(videoFile.videoBytes).toString("base64");
    } else {
      return NextResponse.json(
        { error: "Video generated but no download URI available." },
        { status: 500 }
      );
    }

    const videoUrl = `data:video/mp4;base64,${videoBase64}`;

    return NextResponse.json({
      success: true,
      videoUrl,
      prompt,
    });
  } catch (err: any) {
    console.error("Video generation error:", err);
    return NextResponse.json(
      { error: err.message || "Video generation failed" },
      { status: 500 }
    );
  }
}

// ── Wine Video Prompt ──
function buildWineVideoPrompt(data: Record<string, any>): string {
  const name = data.name || "Fine Wine";
  const producer = data.producer || "";
  const region = data.region || "";
  const country = data.country || "";
  const vintage = data.vintage || "";
  const varietal = data.varietal || "";
  const type = data.type || "red";
  const nose = data.nose || "";
  const palate = data.palate || "";
  const finish = data.finish || "";

  const visualMap: Record<string, string> = {
    red: "deep crimson wine, dark ruby tones, warm candlelight, oak barrel cellar",
    white: "golden straw-colored wine, bright sunlit vineyard, crystal clear glass, morning dew",
    sparkling: "champagne bubbles rising, celebration, golden fizz, crystal flutes, effervescent",
    "rosé": "delicate pink wine, rose petals, sunset hues, garden terrace",
    dessert: "amber honey-colored wine, rich golden tones, autumn harvest, sweet fruit",
    fortified: "deep mahogany wine, aged port barrel, vintage cellar, copper reflections",
  };

  const visualPalette = visualMap[type] || visualMap.red;
  const locationVibes =
    region && country
      ? `${region}, ${country} vineyard landscape`
      : region
        ? `${region} vineyard landscape`
        : "prestigious vineyard estate";

  const sensoryNotes = [nose, palate, finish].filter(Boolean).join(", ");
  const sensoryVisuals = sensoryNotes ? `Evoking ${sensoryNotes}.` : "";

  return [
    `Cinematic slow-motion close-up of a bottle of ${name}${vintage ? ` ${vintage}` : ""}${producer ? ` by ${producer}` : ""}.`,
    `${visualPalette}.`,
    `Set against ${locationVibes}.`,
    varietal ? `${varietal} grapes on the vine.` : "",
    `Wine being poured into a crystal glass with perfect clarity.`,
    sensoryVisuals,
    `Professional wine photography, 4K cinematic, shallow depth of field, golden hour lighting, luxury brand aesthetic.`,
  ].filter(Boolean).join(" ");
}

// ── Ticket / Event Video Prompt ──
function buildTicketVideoPrompt(data: Record<string, any>): string {
  const eventName = data.eventName || "Live Event";
  const category = data.category || "concert";
  const venueName = data.venueName || "";
  const tier = data.tier || "general";

  const categoryVisuals: Record<string, string> = {
    concert: "sweeping camera over massive concert crowd, laser lights scanning, bass drops causing visual shockwaves, confetti explosion, artist silhouette on stage",
    sports: "dramatic slow-motion sports action, stadium crowd erupting, camera swooping through arena, instant replay angles, high-energy montage",
    theater: "curtains rising on grand stage, spotlight following performer, audience in awe, dramatic scene transitions, elegant stage movements",
    conference: "futuristic keynote stage reveal, holographic displays activating, audience reacting, dynamic transitions between speakers, tech innovation montage",
    festival: "aerial drone shot over festival grounds at sunset, multiple stages with synchronized light shows, happy crowd dancing, fireworks finale",
  };

  const tierVisuals: Record<string, string> = {
    general: "immersive crowd-level perspective, energy and excitement",
    vip: "VIP section reveal, exclusive lounge, champagne toast, premium experience",
    backstage: "behind-the-scenes access, artist preparation, exclusive backstage moments",
    premium: "front-row perspective, unobstructed view, premium comfort",
  };

  const visual = categoryVisuals[category] || categoryVisuals.concert;
  const tierVibe = tierVisuals[tier] || tierVisuals.general;

  return [
    `Cinematic event trailer for "${eventName}".`,
    `${visual}.`,
    venueName ? `Taking place at ${venueName}.` : "",
    `${tierVibe}.`,
    `Cyberpunk color grading with neon cyan and magenta accents.`,
    `Fast-paced cuts, dramatic slow-motion moments, volumetric lighting, lens flares.`,
    `Professional event promotional video, 4K cinematic quality, Hans Zimmer-style epic feeling.`,
  ].filter(Boolean).join(" ");
}

// ── Property / Real Estate Video Prompt ──
function buildPropertyVideoPrompt(data: Record<string, any>): string {
  const name = data.name || "Luxury Property";
  const city = data.city || "";
  const country = data.country || "";
  const propertyType = data.propertyType || "residential";

  const typeVisuals: Record<string, string> = {
    residential: "smooth drone flyover of luxury residential building, descending to reveal infinity pool, camera gliding through modern interiors, floor-to-ceiling windows with city views",
    commercial: "aerial approach to gleaming commercial tower, camera entering grand lobby, elevating through floors, panoramic skyline reveal from rooftop",
    "mixed-use": "street-level approach to mixed-use development, camera rising past retail level into residential floors, rooftop terrace reveal, neighborhood context shot",
    hospitality: "cinematic resort arrival, water feature entrance, camera gliding through spa, pool area at golden hour, suite reveal with ocean view",
  };

  const visual = typeVisuals[propertyType] || typeVisuals.residential;
  const location = [city, country].filter(Boolean).join(", ");

  return [
    `Luxury real estate walkthrough of "${name}".`,
    `${visual}.`,
    location ? `Located in ${location}.` : "",
    `Warm champagne and gold color grading with deep navy shadows.`,
    `Smooth gimbal movements, slow reveals, architectural detail close-ups.`,
    `Professional real estate promotional video, 4K cinematic, golden hour lighting, luxury lifestyle aesthetic.`,
  ].filter(Boolean).join(" ");
}
