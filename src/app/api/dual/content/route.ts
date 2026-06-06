import { NextResponse } from "next/server";
import { getProductionContentManifest, getProductionContentStatus, getSeedPayloads } from "@/lib/production-content";

export const dynamic = "force-dynamic";

export async function GET() {
  const manifest = getProductionContentManifest();
  return NextResponse.json({
    status: getProductionContentStatus(),
    template: manifest.template,
    objects: manifest.objects.map((item) => ({
      contentId: item.contentId,
      name: item.custom.name,
      region: item.custom.region,
      lifecycle: manifest.template.actions,
      readyForDualSeed: true,
    })),
    seedPreview: getSeedPayloads().map((item) => ({
      contentId: item.contentId,
      action: "mint",
      templateId: item.action.mint.template_id,
    })),
    secretsReturned: false,
  });
}
