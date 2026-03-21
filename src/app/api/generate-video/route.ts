import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 min for video generation

const NANO_BANANA_BASE = "https://nanobananavideo.com/api/v1";

/**
 * POST /api/generate-video
 * Generate an AI video from wine metadata using Nano Banana Video API.
 *
 * Body: { name, producer, region, country, vintage, varietal, type, description,
 *         nose, palate, finish, abv, volume }
 *
 * Returns: { success: true, videoUrl: string, prompt: string }
 */
export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.NANO_BANANA_VIDEO_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "NANO_BANANA_VIDEO_API_KEY not configured. Add it to your environment variables." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const prompt = buildVideoPrompt(body);

    // Step 1: Submit text-to-video generation request
    const genRes = await fetch(`${NANO_BANANA_BASE}/text-to-video.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify({
        prompt,
        resolution: "720p",
        duration: 5,
        aspect_ratio: "16:9",
      }),
    });

    const genData = await genRes.json();

    if (!genRes.ok || !genData.success) {
      const errMsg = genData.error || `Nano Banana API error (${genRes.status})`;
      return NextResponse.json({ error: errMsg }, { status: genRes.status || 500 });
    }

    // If video_url is returned immediately, use it
    if (genData.video_url) {
      return NextResponse.json({
        success: true,
        videoUrl: genData.video_url,
        thumbnailUrl: genData.thumbnail_url || null,
        prompt,
      });
    }

    // Step 2: If async, poll for completion
    const videoId = genData.video_id;
    if (!videoId) {
      return NextResponse.json(
        { error: "No video_id or video_url returned from Nano Banana." },
        { status: 500 }
      );
    }

    // Poll with exponential backoff (max ~2 minutes)
    let videoUrl = "";
    let thumbnailUrl = "";
    const maxAttempts = 24;
    let delay = 5000; // start at 5s

    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((r) => setTimeout(r, delay));

      const statusRes = await fetch(
        `${NANO_BANANA_BASE}/video-status.php?video_id=${videoId}`,
        {
          headers: { "X-API-Key": apiKey },
        }
      );
      const statusData = await statusRes.json();

      if (statusData.status === "completed") {
        videoUrl = statusData.video_url || statusData.url || "";
        thumbnailUrl = statusData.thumbnail_url || "";
        break;
      }

      if (statusData.status === "failed") {
        return NextResponse.json(
          { error: statusData.error || "Video generation failed on Nano Banana." },
          { status: 500 }
        );
      }

      // queued or processing — keep waiting, increase delay slightly
      delay = Math.min(delay * 1.2, 10000);
    }

    if (!videoUrl) {
      return NextResponse.json(
        { error: "Video generation timed out. Please try again." },
        { status: 504 }
      );
    }

    return NextResponse.json({
      success: true,
      videoUrl,
      thumbnailUrl,
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

/**
 * Builds a cinematic video prompt from wine metadata.
 */
function buildVideoPrompt(data: Record<string, any>): string {
  const name = data.name || "Fine Wine";
  const producer = data.producer || "";
  const region = data.region || "";
  const country = data.country || "";
  const vintage = data.vintage || "";
  const varietal = data.varietal || "";
  const type = data.type || "red";
  const description = data.description || "";
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
      ? `${region}, ${country} vineyard landscape, terroir`
      : region
        ? `${region} vineyard landscape`
        : "prestigious vineyard estate";

  const sensoryNotes = [nose, palate, finish].filter(Boolean).join(", ");
  const sensoryVisuals = sensoryNotes ? `Evoking flavours of ${sensoryNotes}.` : "";

  // Keep under 500 chars (Nano Banana limit)
  const parts = [
    `Cinematic slow-motion close-up of a bottle of ${name}${vintage ? ` ${vintage}` : ""}${producer ? ` by ${producer}` : ""}.`,
    `${visualPalette}.`,
    `Set against ${locationVibes}.`,
    varietal ? `${varietal} grapes on the vine.` : "",
    `Wine poured into crystal glass.`,
    sensoryVisuals,
    `4K cinematic, shallow depth of field, golden hour, luxury brand aesthetic.`,
  ].filter(Boolean);

  let prompt = parts.join(" ");
  if (prompt.length > 500) prompt = prompt.slice(0, 497) + "...";
  return prompt;
}
