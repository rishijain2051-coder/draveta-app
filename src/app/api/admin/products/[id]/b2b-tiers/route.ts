import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { AccountTier } from "@prisma/client";

const tierSchema = z.object({
  tier: z.nativeEnum(AccountTier),
  minQty: z.number().int().min(1),
  maxQty: z.number().int().nullable(),
  unitPrice: z.number().min(0),
});

const tiersSchema = z.array(tierSchema);

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const tiers = await db.b2BTierPricing.findMany({
      where: { productId: id },
      orderBy: [{ tier: "asc" }, { minQty: "asc" }]
    });

    return NextResponse.json(tiers);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const validatedTiers = tiersSchema.parse(body);

    // Replace all tiers for this product in a transaction
    await db.$transaction([
      db.b2BTierPricing.deleteMany({ where: { productId: id } }),
      db.b2BTierPricing.createMany({
        data: validatedTiers.map(t => ({
          productId: id,
          tier: t.tier,
          minQty: t.minQty,
          maxQty: t.maxQty,
          unitPrice: t.unitPrice,
        }))
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Tier saving error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
