import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { Platform } from "@/lib/enums";

const salesSchema = z.object({
  period: z.string().min(1),
  platform: z.nativeEnum(Platform),
  redemptionCount: z.number().min(0),
  revenue: z.number().min(0),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const validatedData = salesSchema.parse(body);

    const profile = await db.affiliateProfile.findUnique({
      where: { id }
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const commissionOwed = validatedData.revenue * (Number(profile.commissionPercent) / 100);

    const salesLog = await db.affiliateSalesLog.create({
      data: {
        affiliateId: id,
        period: validatedData.period,
        platform: validatedData.platform,
        redemptionCount: validatedData.redemptionCount,
        revenue: validatedData.revenue,
        commissionOwed,
        paymentStatus: "PENDING"
      },
    });

    return NextResponse.json({ success: true, logId: salesLog.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
