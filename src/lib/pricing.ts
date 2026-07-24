import { db } from "./db";
import type { AccountTier } from "@prisma/client";

type PriceResult = {
  unitPrice: number;
  source: "volume_breakpoint" | "account_discount" | "base_price";
};

export async function getB2BPrice(
  productId: string,
  tier: AccountTier,
  quantity: number,
  accountDiscount: number
): Promise<PriceResult> {
  const tierPricing = await db.b2BTierPricing.findMany({
    where: { productId, tier },
    orderBy: { minQty: "asc" },
  });

  if (tierPricing.length > 0) {
    const match = tierPricing.find(
      (tp) => quantity >= tp.minQty && (tp.maxQty === null || quantity <= tp.maxQty)
    );
    if (match) {
      return {
        unitPrice: Number(match.unitPrice),
        source: "volume_breakpoint",
      };
    }
  }

  if (accountDiscount > 0) {
    const product = await db.product.findUnique({
      where: { id: productId },
      select: { basePrice: true },
    });
    if (product) {
      const discounted =
        Number(product.basePrice) * (1 - accountDiscount / 100);
      return { unitPrice: Math.round(discounted * 100) / 100, source: "account_discount" };
    }
  }

  const product = await db.product.findUnique({
    where: { id: productId },
    select: { basePrice: true },
  });

  return {
    unitPrice: product ? Number(product.basePrice) : 0,
    source: "base_price",
  };
}

export async function getTierPricingTable(
  productId: string,
  tier: AccountTier
) {
  return db.b2BTierPricing.findMany({
    where: { productId, tier },
    orderBy: { minQty: "asc" },
  });
}
