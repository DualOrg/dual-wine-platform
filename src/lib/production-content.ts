import content from "@/data/dual-production-content.json";
import type { Wine } from "@/types/dual";

type ContentObject = (typeof content.objects)[number];
const DUAL_EXPLORER_BASE = "https://explorer.dual.network";
const DUAL_L2_EXPLORER_BASE = "https://blockscout.dual.network";

export function getProductionContentManifest() {
  return content;
}

export function getProductionContentStatus() {
  const mappedObjects = content.objects.filter((item) => item.dual?.objectId && item.dual?.readbackVerified);
  const templateId = process.env.DUAL_TEMPLATE_ID || content.template.id || "";
  return {
    app: content.app,
    version: content.version,
    updatedAt: content.updatedAt,
    contentReady: content.objects.length > 0,
    objectCount: content.objects.length,
    mappedObjectCount: mappedObjects.length,
    readbackVerified: mappedObjects.length === content.objects.length,
    template: content.template,
    targetNetwork: content.network.target,
    orgId: content.network.orgId,
    liveDualMapping: {
      templateEnv: content.template.env,
      templateId,
      templateIdConfigured: Boolean(templateId),
      credentialsConfigured: Boolean(process.env.DUAL_API_KEY || process.env.DUAL_API_TOKEN),
      objectIds: mappedObjects.map((item) => item.dual.objectId),
      readbackVerified: mappedObjects.length === content.objects.length,
      writeMode: process.env.DUAL_WRITE_MODE || "read_only",
      publicWrites: process.env.DEMO_PUBLIC_DUAL_WRITES === "true",
    },
  };
}

function toWine(item: ContentObject): Wine {
  const c = item.custom;
  const templateId = process.env.DUAL_TEMPLATE_ID || content.template.id || content.template.slug;
  const objectId = item.dual?.objectId || item.contentId;
  return {
    id: item.contentId,
    templateId,
    objectId,
    contentHash: item.dual?.stateHash,
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
    status: item.dual?.readbackVerified ? "anchored" : "minted",
    ownerId: content.network.orgId,
    createdAt: content.updatedAt,
    updatedAt: item.dual?.mintedAt || content.updatedAt,
    blockchainTxHash: item.dual?.integrityHash,
    explorerLinks: item.dual?.objectId ? {
      owner: null,
      contentHash: item.dual?.integrityHash ? `${DUAL_L2_EXPLORER_BASE}/tx/${item.dual.integrityHash}` : null,
      integrityHash: `${DUAL_EXPLORER_BASE}/objects/${item.dual.objectId}`,
      org: content.template.id ? `${DUAL_EXPLORER_BASE}/templates/${content.template.id}` : null,
    } : undefined,
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
