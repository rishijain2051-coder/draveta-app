import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { AccountTier, UserStatus } from "@prisma/client";

const updateSchema = z.object({
  tier: z.nativeEnum(AccountTier),
  discountPercentage: z.number().min(0).max(100),
  status: z.nativeEnum(UserStatus),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const validatedData = updateSchema.parse(body);

    const updatedAccount = await db.b2BAccount.update({
      where: { id },
      data: {
        tier: validatedData.tier,
        discountPercentage: validatedData.discountPercentage,
        status: validatedData.status,
      },
    });

    return NextResponse.json({ success: true, account: updatedAccount });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
