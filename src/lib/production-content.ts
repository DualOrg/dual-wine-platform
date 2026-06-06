import content from "@/data/dual-production-content.json";
import type { Wine } from "@/types/dual";

type ContentObject = (typeof content.objects)[number];

export function getProductionContentManifest() {
  return content;
}

export function getProductionContentStatus() {
  return {
    app: content.app,
    version: content.version,
    updatedAt: content.updatedAt,
    contentReady: content.objects.length > 0,
    objectCount: content.objects.length,
    template: content.template,
    targetNetwork: content.network.target,
    orgId: content.network.orgId,
    liveDualMapping: {
      templateEnv: content.template.env,
      templateIdConfigured: Boolean(process.env.DUAL_TEMPLATE_ID),
      credentialsConfigured: Boolean(process.env.DUAL_API_KEY || process.env.DUAL_API_TOKEN),
      writeMode: process.env.DUAL_WRITE_MODE || "read_only",
      publicWrites: process.env.DEMO_PUBLIC_DUAL_WRITES === "true",
    },
  };
}

function toWine(item: ContentObject): Wine {
  const c = item.custom;
  return {
    id: item.contentId,
    templateId: process.env.DUAL_TEMPLATE_ID || content.template.slug,
    objectId: item.contentId,
    contentHash: undefined,
    wineData: {
      name: c.name,
      producer: c.producer,
      region: c.region,
      country: c.country,
      vintage: c.vintage,
      varietal: c.varietal,
      type: c.type as Wine["wineData"]["type"],
      abv: c.abv,
      volume: c.volume,
      quantity: c.quantity,
      condition: c.condition as Wine["wineData"]["condition"],
      storage: c.storage as Wine["wineData"]["storage"],
      drinkingWindow: c.drinkingWindow,
      ratings: c.ratings,
      certifications: c.certifications,
      currentValue: c.currentValue,
      purchasePrice: c.purchasePrice,
      description: c.description,
      tastingNotes: c.tastingNotes,
      imageUrl: c.imageUrl,
    },
    provenance: content.template.actions.map((action, index) => ({
      id: `${item.contentId}-${action}`,
      timestamp: content.updatedAt,
      type: action.toUpperCase(),
      description: `${action.replace(/_/g, " ")} milestone prepared for DUAL mainnet readback`,
      actor: "Dual Labs",
      verified: false,
      txHash: undefined,
      location: c.region,
    })),
    faces: [],
    status: "minted",
    ownerId: content.network.orgId,
    createdAt: content.updatedAt,
    updatedAt: content.updatedAt,
    blockchainTxHash: undefined,
    explorerLinks: undefined,
  };
}

export function getProductionWines(): Wine[] {
  return content.objects.map(toWine);
}

export function getSeedPayloads() {
  return content.objects.map((item) => ({
    contentId: item.contentId,
    action: {
      mint: {
        template_id: process.env.DUAL_TEMPLATE_ID || "<DUAL_TEMPLATE_ID>",
        num: 1,
        data: {
          metadata: item.metadata,
          custom: item.custom,
        },
      },
    },
  }));
}
